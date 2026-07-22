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

        player.tell(`${player.profile.name} incoming !!!!`)
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
            player.tell(`${player.profile.name} we got you!`)
        })

        server.scheduleInTicks(50, () => {
            // Title
            server.runCommandSilent(
                `execute as ${player.uuid} at ${player.uuid} run title ${player.uuid} title '{"text":"Fractured","color":"red","bold":true}'`
            )
            // Subtitle
            server.runCommandSilent(
                `execute as ${player.uuid} at ${player.uuid} run title ${player.uuid} subtitle '{"text":"by benbenlaw","color":"yellow"}'`
            )
        })

        server.scheduleInTicks(80, () => {
            player.tell(`Start the engine (Hold Forward)`)
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
        event.entity.tell('You have entered the Undergarden. Be careful, it is a dangerous place!')
    }
    if (dimension == 'minecraft:overworld') {
        event.entity.tell('Home sweet home!')
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
            player.tell('You need to be wearing a full set of Faraday Armor to use this item!')
        }
    } else {
        player.tell('You need to be standing on a Immersive Engineering Lightning Rod to use this item!')
    }
})

//Main Island Teleporter
ItemEvents.rightClicked('fractured:main_island_teleporter', event => {
    const { player, level, hand, item } = event

    if (level.clientSide) retur

    if (level.dimension == 'minecraft:the_end') {

        event.server.runCommandSilent(`execute as ${player.uuid} at ${player.uuid} run tp 0 66 0`)

        if (!player.creative) {
            item.count--
        }
    } 
    else {
        player.tell('You need to be in The End to use this item!')
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
        player.displayClientMessage(Component.literal('§cNo Catacombs found nearby!'), true)
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
        player.displayClientMessage(Component.literal('§cNo Malachite Watchtower found nearby!'), true)
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

                    player.tell([
                        Component.gold("Found "),
                        Component.yellow(name),
                        Component.gold(" reservoir! "),
                        Component.white(`(${percent}% full)`)
                    ]);
                } else {
                    player.tell(Component.red("No reservoir found at your current coordinates."));
                }

                return 1;
            })
    );
});