Platform.getInfo('fractured').name = 'Fractured'

const $FlintAndSteelItem = Java.loadClass("net.minecraft.world.item.FlintAndSteelItem");
const $ItemProperties = Java.loadClass("net.minecraft.world.item.Item$Properties");

StartupEvents.registry('item', event => {

    // Misc
    event.createCustom('fractured:flint_and_stick', () => 
        new $FlintAndSteelItem(new $ItemProperties().durability(4))
    )
    event.create('fractured:survivalist_compound')
    event.create('fractured:pestle')
    event.create('fractured:mortar_and_pestle').maxStackSize(1)
    event.create('fractured:dried_leaves')
    event.create('fractured:grout_dust')
    event.create('fractured:metallic_dust')
    event.create('fractured:grout_brick')
    event.create('fractured:small_coal_coke')
    event.create('fractured:netherrack_rocks')
    event.create('fractured:dye_extractor').maxStackSize(1).maxDamage(127).tooltip(Text.translate('tooltip.fractured.dye_extractor'))
    event.create('fractured:blueprint_paper')
    event.create('fractured:wheat_flour').tag(['c:wheat_flour', 'c:dusts'])
    event.create('fractured:lightning_charge')
    event.create('fractured:malachite_heart')
    event.create('fractured:control_press')
    event.create('fractured:printed_control_circuit')
    event.create('fractured:main_island_teleporter')
    event.create('fractured:void_chest')
    event.create('fractured:void_bucket')
    event.create('fractured:void_ingot').tag(['c:ingots','c:ingots/void'])
    event.create('fractured:void_staff')
    event.create('fractured:portable_seismic_survey_tool')
    event.create('fractured:ash')


    // Template
    event.create('fractured:cloggrum_template')
    event.create('fractured:froststeel_template')

    // Catalysts
    event.create('fractured:forgotten_catalyst')
    event.create('fractured:colored_catalyst')
    event.create('fractured:gaia_catalyst')
    event.create('fractured:nether_catalyst')
    event.create('fractured:end_catalyst')
    event.create('fractured:overworld_catalyst')

    // Tool Binding
    event.create('fractured:leafy_binding').tag('fractured:bindings').tooltip(Text.translate('tooltip.fractured.leafy_binding'))
    event.create('fractured:reinforced_binding').tag('fractured:bindings').tooltip(Text.translate('tooltip.fractured.reinforced_binding'))
    event.create('fractured:steel_binding').tag('fractured:bindings').tooltip(Text.translate('tooltip.fractured.steel_binding'))
    event.create('fractured:diamond_binding').tag('fractured:bindings').tooltip(Text.translate('tooltip.fractured.diamond_binding'))
    event.create('fractured:netherite_binding').tag('fractured:bindings').tooltip(Text.translate('tooltip.fractured.netherite_binding'))
    
    // Locators
    event.create('fractured:catacombs_locator').maxStackSize(16).tooltip(Text.translate('tooltip.fractured.catacombs_locator'))
    event.create('fractured:malachite_watchtower_locator').maxStackSize(16).tooltip(Text.translate('tooltip.fractured.malachite_watchtower_locator'))

    // Tool Molds
    event.create('fractured:axe_mold').tag(['c:molds/axe', 'casting:molds'])
    event.create('fractured:hoe_mold').tag(['c:molds/hoe', 'casting:molds'])
    event.create('fractured:pickaxe_mold').tag(['c:molds/pickaxe', 'casting:molds'])
    event.create('fractured:shovel_mold').tag(['c:molds/shovel', 'casting:molds'])
    event.create('fractured:sword_mold').tag(['c:molds/sword', 'casting:molds'])

    // Ore Tiers 
    oreTypes.forEach(ore => {
        event.create(`fractured:impure_${ore}`).tag([`c:impure_${ore}s`])
        event.create(`fractured:pure_${ore}`).tag([`c:pure_${ore}s`]).glow(true)
    })

    // Catalogs
    event.create('fractured:survival_catalog').displayName('Catalog: Survival').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:hot_hot_hot_catalog').displayName('Catalog: Hot Hot Hot').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:undergarden_catalog').displayName('Catalog: Undergarden').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:void_catalog').displayName('Catalog: Void').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:desert_catalog').displayName('Catalog: Desert').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:caves_catalog').displayName('Catalog: Caves').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:gaia_catalog').displayName('Catalog: Gaia').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:nether_catalog').displayName('Catalog: Nether').tag('shops:catalogs').maxStackSize(1).glow(true)
    event.create('fractured:end_catalog').displayName('Catalog: End').tag('shops:catalogs').maxStackSize(1).glow(true)

    // Tool Parts
    materials.forEach(material => {
        createToolPart(material)
    })

    function createToolPart(material) {
        event.create(`fractured:${material}_axe_head`).tag(['fractured:axe_heads'])
        event.create(`fractured:${material}_hoe_head`).tag(['fractured:hoe_heads'])
        event.create(`fractured:${material}_pickaxe_head`).tag(['fractured:pickaxe_heads'])
        event.create(`fractured:${material}_shovel_head`).tag(['fractured:shovel_heads'])
        event.create(`fractured:${material}_sword_blade`).tag(['fractured:sword_blades'])
    }


})