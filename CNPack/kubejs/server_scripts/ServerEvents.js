//Server Events

//Set gamerules
ServerEvents.loaded(event => {

  if (event.server.persistentData.gameRules) return
  event.server.gameRules.set("doTraderSpawning", false)
  event.server.gameRules.set("doInsomnia", false)
  event.server.gameRules.set("playersNetherPortalDefaultDelay", 20)
  event.server.persistentData.gameRules = true

})


//Spawning Gyrodynes when player falls into the void and giving them a warning message beforehand. Also gives them a title and subtitle when they spawn in the ship. Only happens once per player.

PlayerEvents.tick(event => {
    let player = event.player
    let server = event.server

    //if (player.y > 301 && player.y < 310 && player.tags.contains('given_ship')) {
    //    player.tags.remove('given_ship')
    //}
         

    if (player.y < 300 && player.y > 290 && !player.tags.contains('given_ship') && !player.isCreative() && !player.isSpectator()) {

        player.tell(Text.translate('fractured.gyro.incoming', player.profile.name))
        //player.potionEffects.add('minecraft:blindness', 100, 0)

        server.scheduleInTicks(20, () => {
            server.runCommandSilent(
                `summon immersive_aircraft:gyrodyne ${player.x} ${player.y - 40} ${player.z} {Tags:["spawned_gyro"]}`
            )
        })

        server.scheduleInTicks(23, () => {
            server.runCommandSilent(
                `execute as ${player.uuid} at ${player.uuid} run ride @s mount @e[type=immersive_aircraft:gyrodyne,limit=1,sort=nearest]`
            )
        })

        server.scheduleInTicks(35, () => {
            player.tell(Text.translate('fractured.gyro.saved', player.profile.name))
        })

        server.scheduleInTicks(50, () => {
            // Title
            server.runCommandSilent(
                `execute as ${player.uuid} at ${player.uuid} run title ${player.uuid} title '{"translate":"fractured.title","color":"red","bold":true}'`
            )
            // Subtitle
            server.runCommandSilent(
                `execute as ${player.uuid} at ${player.uuid} run title ${player.uuid} subtitle '{"translate":"fractured.subtitle","color":"yellow"}'`
            )
        })

        server.scheduleInTicks(80, () => {
            player.tell(Text.translate('fractured.gyro.start_engine'))
        })


        player.tags.add('given_ship')
    }
})

PlayerEvents.respawned(event => {
    let player = event.player

    if (player.tags.contains('given_ship')) {
        player.tags.remove('given_ship')
    }
})


EntityEvents.spawned(event => {
    if (!event.entity.isLiving()) return
    const dimension = event.level.dimension

    if (dimension == 'undergarden:undergarden') {
        event.entity.tell(Text.translate('fractured.dimension.undergarden'))
    }
    if (dimension == 'minecraft:overworld') {
        event.entity.tell(Text.translate('fractured.dimension.overworld'))
    }
})

//Lightning Charge
ItemEvents.rightClicked('fractured:lightning_charge', event => {
    const { player, level, hand, item } = event

    if (level.clientSide) return

    const blockBelow = level.getBlock(player.blockPosition().below())

    if (blockBelow.id == 'immersiveengineering:lightning_rod') {

        if (event.player.getFeetArmorItem().hasTag('fractured:conductive_armor') &&
            event.player.getLegsArmorItem().hasTag('fractured:conductive_armor') &&
            event.player.getChestArmorItem().hasTag('fractured:conductive_armor') &&
            event.player.getHeadArmorItem().hasTag('fractured:conductive_armor') 
        
        ) {

            event.server.runCommandSilent(`execute as ${player.uuid} at ${player.uuid} run summon lightning_bolt`)

            if (!player.creative) {
                item.count--
            }
        } 
        else {
            player.tell(Text.translate('fractured.lightning_charge.no_armor'))
        }
    } else {
        player.tell(Text.translate('fractured.lightning_charge.no_rod'))
    }
})

//Main Island Teleporter
ItemEvents.rightClicked('fractured:main_island_teleporter', event => {
    const { player, level, hand, item } = event

    if (level.clientSide) return

    if (level.dimension == 'minecraft:the_end') {

        event.server.runCommandSilent(`execute as ${player.uuid} at ${player.uuid} run tp 0 66 0`)

        if (!player.creative) {
            item.count--
        }
    } 
    else {
        player.tell(Text.translate('fractured.teleporter.not_in_end'))
    }
    
})

//Portable Seismic Survey Tool
ItemEvents.rightClicked('fractured:portable_seismic_survey_tool', event => {
    const { player, level, hand, item } = event
    if (level.clientSide) return
    event.server.runCommand(`execute as ${player.uuid} at ${player.uuid} run findreservoir`)
})


//Locators
const $Registry = Java.loadClass('net.minecraft.core.registries.Registries')
const $TagKey = Java.loadClass('net.minecraft.tags.TagKey')

ItemEvents.rightClicked('fractured:catacombs_locator', event => {
    const { player, level, hand, item } = event

    if (level.clientSide) return

    let structureTag = $TagKey.create($Registry.STRUCTURE, 'fractured:catacombs')
    let foundPos = level.findNearestMapStructure(structureTag, player.blockPosition(), 100, false)

    if (foundPos != null) {
        // Spawn vanilla ender eye entity pointing to the structure
        let eye = level.createEntity('minecraft:eye_of_ender')
        eye.setPos(player.x, player.eyeY - 0.1, player.z)
        eye.signalTo(foundPos)
        eye.setItem(Item.of('fractured:catacombs_locator'))
        level.addFreshEntity(eye)

        player.swing(hand)
        if (!player.creative) {
            item.count--
        }
    } else {
        player.displayClientMessage(Text.translate('fractured.locator.catacombs_not_found'), true)
    }
})

ItemEvents.rightClicked('fractured:malachite_watchtower_locator', event => {
    const { player, level, hand, item } = event

    if (level.clientSide) return

    let structureTag = $TagKey.create($Registry.STRUCTURE, 'fractured:malachite_watchtower')
    let foundPos = level.findNearestMapStructure(structureTag, player.blockPosition(), 100, false)

    if (foundPos != null) {
        // Spawn vanilla ender eye entity pointing to the structure
        let eye = level.createEntity('minecraft:eye_of_ender')
        eye.setPos(player.x, player.eyeY - 0.1, player.z)
        eye.signalTo(foundPos)
        eye.setItem(Item.of('fractured:malachite_watchtower_locator'))
        level.addFreshEntity(eye)

        player.swing(hand)
        if (!player.creative) {
            item.count--
        }
    } else {
        player.displayClientMessage(Text.translate('fractured.locator.malachite_not_found'), true)
    }
})

ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event;

    event.register(
        Commands.literal('findreservoir')
            .requires(source => source.hasPermission(0))
            .executes(ctx => {
                const { source } = ctx;
                const { player, level } = source;
                
                const ReservoirHandler = Java.loadClass('flaxbeard.immersivepetroleum.api.reservoir.ReservoirHandler');
                const ColumnPos = Java.loadClass('net.minecraft.server.level.ColumnPos');

                const playerCol = new ColumnPos(player.blockPosition().x, player.blockPosition().z);
                let reservoir = ReservoirHandler['getReservoir(net.minecraft.world.level.Level,net.minecraft.server.level.ColumnPos)'](level, playerCol);

                if (reservoir) {
                    let resType = reservoir.getType().value();
                    let name = resType.name;
                    let amount = reservoir.getAmount();
                    let capacity = reservoir.getCapacity();
                    let percent = ((amount / capacity) * 100).toFixed(1);

                    player.tell(Text.translate('fractured.reservoir.found', name, percent));
                } else {
                    player.tell(Text.translate('fractured.reservoir.not_found').red());
                }

                return 1;
            })
    );
});