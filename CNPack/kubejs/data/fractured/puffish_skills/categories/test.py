import os
import json
import re
from pathlib import Path

class TranslationManager:
    """
    负责管理 Key 生成、去重与文本复用的管理器
    """
    def __init__(self, mod_id: str = "puffish_skills"):
        self.mod_id = mod_id
        # 保存全局 key -> text 的映射
        self.lang_dict = {}
        # 保存 text -> key 的映射，实现相同文本复用相同 key
        self.text_to_key = {}
        # 记录已使用的 key 集合，防止不同文本冲突
        self.used_keys = set()

    def sanitize_key(self, text: str) -> str:
        """
        清理字符串，使其符合翻译键规范
        """
        text = text.lower()
        # 常见符号的处理
        text = text.replace('+', '_').replace('%', '_').replace('.', '_')
        text = re.sub(r'[^a-z0-9_]', '_', text)
        text = re.sub(r'_+', '_', text).strip('_')
        return text if text else "text"

    def get_or_create_key(self, text: str, prefix: str, fallback_id: str = "") -> str:
        """
        获取已有的 key 或创建新的唯一 key
        - text: 待翻译的原始文本
        - prefix: 键名前缀，例如 "puffish_skills.skills.combat"
        - fallback_id: 用于生成候选 key 的默认标识（如技能 id）
        """
        # 1. 检查完全相同的文本是否在当前前缀/范围内已经存在键，实现【相同文本复用键】
        text_scope_key = f"{prefix}::{text}"
        if text_scope_key in self.text_to_key:
            return self.text_to_key[text_scope_key]

        # 2. 生成候选的基础 Key 名
        base_name = self.sanitize_key(fallback_id) if fallback_id else self.sanitize_key(text)
        candidate_key = f"{prefix}.{base_name}"

        # 3. 解决【不同文本冲突相同的 Key】：如果键名重复但文本不同，加上自增序号
        final_key = candidate_key
        counter = 2
        while final_key in self.used_keys and self.lang_dict.get(final_key) != text:
            final_key = f"{candidate_key}_{counter}"
            counter += 1

        # 4. 登记并返回最终确定无冲突的 Key
        self.used_keys.add(final_key)
        self.lang_dict[final_key] = text
        self.text_to_key[text_scope_key] = final_key
        return final_key

def process_category_file(file_path: Path, manager: TranslationManager) -> tuple[dict, str]:
    """
    处理 category.json 类型的文件
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    category_name = "default"
    
    if "title" in data:
        if isinstance(data["title"], str):
            raw_title = data["title"]
            category_name = manager.sanitize_key(raw_title)
            key = manager.get_or_create_key(
                text=raw_title,
                prefix=f"{manager.mod_id}.category",
                fallback_id=category_name
            )
            data["title"] = {"translate": key}
        elif isinstance(data["title"], dict) and "translate" in data["title"]:
            key = data["title"]["translate"]
            parts = key.split('.')
            if len(parts) >= 3:
                category_name = parts[2]

    return data, category_name

def process_definitions_file(file_path: Path, category_name: str, manager: TranslationManager) -> dict:
    """
    处理 definitions.json / skills.json 类型的文件
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    prefix = f"{manager.mod_id}.skills.{category_name}"
    
    for skill_id, skill_data in data.items():
        if not isinstance(skill_data, dict):
            continue
            
        # 1. 处理 title
        if "title" in skill_data and isinstance(skill_data["title"], str):
            raw_title = skill_data["title"]
            key = manager.get_or_create_key(
                text=raw_title,
                prefix=prefix,
                fallback_id=f"{skill_id}_title"
            )
            skill_data["title"] = {"translate": key}
            
        # 2. 处理 description (如有)
        if "description" in skill_data and isinstance(skill_data["description"], str):
            raw_desc = skill_data["description"]
            key = manager.get_or_create_key(
                text=raw_desc,
                prefix=prefix,
                fallback_id=f"{skill_id}_desc"
            )
            skill_data["description"] = {"translate": key}

    return data

def process_directory(input_dir: str, output_dir: str, mod_id: str = "puffish_skills"):
    """
    批量处理整个目录下的所有分类与技能定义文件
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    manager = TranslationManager(mod_id=mod_id)
    
    for root, dirs, files in os.walk(input_path):
        rel_path = Path(root).relative_to(input_path)
        target_dir = output_path / rel_path
        target_dir.mkdir(parents=True, exist_ok=True)
        
        category_name = manager.sanitize_key(rel_path.name) if rel_path.name else "default"
        category_file = None
        
        # 1. 查找并处理分类文件
        for file in files:
            if file.lower() in ["category.json", "category_definition.json"]:
                category_file = Path(root) / file
                break
                
        if category_file and category_file.exists():
            cat_data, detected_cat_name = process_category_file(category_file, manager)
            if detected_cat_name:
                category_name = detected_cat_name
                
            with open(target_dir / category_file.name, 'w', encoding='utf-8') as f:
                json.dump(cat_data, f, indent=4, ensure_ascii=False)
        
        # 2. 处理技能定义文件
        for file in files:
            if category_file and file == category_file.name:
                continue
                
            if file.endswith(".json"):
                file_p = Path(root) / file
                skills_data = process_definitions_file(file_p, category_name, manager)
                
                with open(target_dir / file, 'w', encoding='utf-8') as f:
                    json.dump(skills_data, f, indent=4, ensure_ascii=False)

    # 3. 输出汇总的语言字典 (en_us.json)
    lang_out_path = output_path / "en_us.json"
    with open(lang_out_path, 'w', encoding='utf-8') as f:
        json.dump(manager.lang_dict, f, indent=4, ensure_ascii=False)

    print(f"处理完成！修改后的配置及提取的语言文件均在: {output_path.absolute()}")
    print(f"共合并提取了 {len(manager.lang_dict)} 条独立的翻译项。")

if __name__ == "__main__":
    import sys
    input_folder = sys.argv[1] if len(sys.argv) > 1 else "D:/mc/mod/Fractured-Opolis-Chinese/CNPack/kubejs/data/fractured/puffish_skills/categories"
    output_folder = sys.argv[2] if len(sys.argv) > 2 else "./output"
    process_directory(input_folder, output_folder)