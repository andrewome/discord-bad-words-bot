/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-expressions */
import { should } from 'chai';
import { Permissions, RichEmbed } from 'discord.js';
import { Server } from '../../../main/storage/Server';
import { Command } from '../../../main/command/Command';
import { MessageCheckerSettings } from '../../../main/storage/MessageCheckerSettings';
import { StarboardSettings } from '../../../main/storage/StarboardSettings';
import { StarboardGetThresholdCommand } from '../../../main/command/starboardcommands/StarboardGetThresholdCommand';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';

should();

let server: Server;
const adminPerms = new Permissions(['ADMINISTRATOR']);
const command = new StarboardGetThresholdCommand();
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { THRESHOLD_NOT_SET } = StarboardGetThresholdCommand;
const { EMBED_TITLE } = StarboardGetThresholdCommand;

beforeEach((): void => {
    server = new Server(
        '123',
        new MessageCheckerSettings(null, null, null, null),
        new StarboardSettings(null, null, null),
);
});

describe('GetStarboardChannelCommand class test suite', (): void => {
    it('No permission check', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs = new CommandArgs(server, new Permissions([]), checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Threshold not set', (): void => {
        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(THRESHOLD_NOT_SET);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
    it('Threshold set', (): void => {
        const threshold = 10;
        server.starboardSettings.setThreshold(threshold);

        const checkEmbed = (embed: RichEmbed): void => {
            // Check embed
            embed.color!.toString(16).should.equals(EMBED_DEFAULT_COLOUR);
            embed.fields!.length.should.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(`The emoji threshold is currently ${threshold}.`);
        };

        const commandArgs = new CommandArgs(server, adminPerms, checkEmbed);
        const commandResult = command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
        commandResult.shouldSaveServers.should.be.false;
    });
});
