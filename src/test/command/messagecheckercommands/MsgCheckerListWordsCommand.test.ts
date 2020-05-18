/* eslint-disable @typescript-eslint/no-unused-vars, no-restricted-syntax, no-unused-expressions */
import { should } from 'chai';
import { MessageEmbed, Permissions } from 'discord.js';
import { MsgCheckerListWordsCommand } from '../../../main/command/messagecheckercommands/MsgCheckerListWordsCommand';
import { Command } from '../../../main/command/Command';
import { Server } from '../../../main/storage/Server';
import { CommandArgs } from '../../../main/command/classes/CommandArgs';
import { DatabaseConnection } from '../../../main/DatabaseConnection';
import { Storage } from '../../../main/storage/Storage';
import { deleteDbFile, TEST_STORAGE_PATH } from '../../TestsHelper';

should();

const adminPerms = new Permissions(['ADMINISTRATOR']);
const EMBED_DEFAULT_COLOUR = Command.EMBED_DEFAULT_COLOUR.replace(/#/g, '');
const EMBED_ERROR_COLOUR = Command.EMBED_ERROR_COLOUR.replace(/#/g, '');
const { EMBED_TITLE } = MsgCheckerListWordsCommand;
const { NO_WORDS_FOUND } = MsgCheckerListWordsCommand;

describe('ListCommandsCommand test suite', (): void => {
    // Set storage path and remove testing.db
    before((): void => {
        deleteDbFile();
        DatabaseConnection.setStoragePath(TEST_STORAGE_PATH);
    });

    // Before each set up new instances
    const command = new MsgCheckerListWordsCommand();
    let server: Server;
    let storage: Storage;
    const serverId = '69420';
    beforeEach((): void => {
        storage = new Storage().loadServers();
        storage.initNewServer(serverId);
        server = storage.servers.get(serverId)!;
    });

    afterEach((): void => {
        deleteDbFile();
    });

    it('No permission check', async (): Promise<void> => {
        const checkEmbed = (embed: MessageEmbed): void => {
            embed.color!.toString(16).should.equals(Command.EMBED_ERROR_COLOUR);
            embed.fields!.length.should.be.equals(1);

            const field = embed.fields![0];
            field.name.should.equals(Command.ERROR_EMBED_TITLE);
            field.value.should.equals(Command.NO_PERMISSIONS_MSG);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: new Permissions([]),
            messageReply: checkEmbed,
        };

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });

    it('Embed should show all bannedWords', async (): Promise<void> => {
        // Set banned words
        const bannedWords = ['word1', 'word2', 'word3'];
        server.messageCheckerSettings.addBannedWords(serverId, bannedWords);

        const checkEmbed = (embed: MessageEmbed): void => {
            // Get output string
            let output = '';
            for (const word of bannedWords) {
                output += `${word}\n`;
            }

            // Check colour
            embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

            // Check field
            embed.fields!.length.should.be.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(output);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };

        const commandResult = await command.execute(commandArgs);

        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
    it('Embed should show if no bannedWords', async (): Promise<void> => {
        const checkEmbed = (embed: MessageEmbed): void => {
            // Check colour
            embed.color!.toString(16).should.equal(EMBED_DEFAULT_COLOUR);

            // Check field
            embed.fields!.length.should.be.equals(1);
            const field = embed.fields![0];
            field.name.should.equals(EMBED_TITLE);
            field.value.should.equals(NO_WORDS_FOUND);
        };

        const commandArgs: CommandArgs = {
            server,
            memberPerms: adminPerms,
            messageReply: checkEmbed,
        };
        const commandResult = await command.execute(commandArgs);
        // Check command result
        commandResult.shouldCheckMessage.should.be.true;
    });
});
