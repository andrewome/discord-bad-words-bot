import { Permissions, MessageEmbed } from 'discord.js';
import { Command } from '../Command';
import { Server } from '../../storage/Server';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';

export class MsgCheckerAddWordCommand extends Command {
    public static ADDED_WORDS = 'Added Words(s):';

    public static MAYBE_WORDS_ALREADY_ADDED = 'Perhaps those word(s) are already added?';

    public static UNABLE_TO_ADD_WORDS = 'Unable To Add:';

    public static readonly NAME = 'MsgCheckerAddWords';

    public static readonly DESCRIPTION = 'Add word(s) to the blacklist.';

    /** CheckMessage: false */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(false);

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    private args: string[];

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function executes the addword command
     * Adds word(s) to the banned list array of the server
     *
     * @param { CommandArgs } commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const { server, memberPerms, messageReply } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Execute
        const { wordsAdded, wordsNotAdded } = this.changeServerSettings(server);

        // Generate output embed
        const embed = this.generateEmbed(wordsAdded, wordsNotAdded);

        // Send output
        await messageReply({ embeds: [embed] });
        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * Generates output embed to be sent back to user.
     *
     * @param  {string[]} wordsAdded Words successfully added
     * @param  {string[]} wordsNotAdded Words unsuccessfully added
     * @returns RichEmbed
     */
    public generateEmbed(wordsAdded: string[],
                         wordsNotAdded: string[]): MessageEmbed {
        const words = this.args;
        let embed = new MessageEmbed().setColor(Command.EMBED_DEFAULT_COLOUR);
        if (wordsAdded.length !== 0) {
            let output = '';
            for (let i = 0; i < wordsAdded.length; i++) {
                output += wordsAdded[i];
                output += '\n';
            }
            embed.addField(MsgCheckerAddWordCommand.ADDED_WORDS, output, false);
        }

        if (wordsNotAdded.length !== 0) {
            let output = '';
            for (let i = 0; i < wordsNotAdded.length; i++) {
                output += wordsNotAdded[i];
                output += '\n';
            }
            output += MsgCheckerAddWordCommand.MAYBE_WORDS_ALREADY_ADDED;
            embed.addField(MsgCheckerAddWordCommand.UNABLE_TO_ADD_WORDS, output, false);
        }

        if (words.length === 0) {
            embed = new MessageEmbed()
                .setColor(Command.EMBED_ERROR_COLOUR)
                .addField(
                    MsgCheckerAddWordCommand.ERROR_EMBED_TITLE,
                    MsgCheckerAddWordCommand.NO_ARGUMENTS,
                );
        }

        return embed;
    }

    /**
     * Changed the settings of server object
     *
     * @param  {Server} server the discord server
     * @returns any An object comprising 2 lists, one of the words added and
     *              one of those not added
     */
    public changeServerSettings(server: Server): { wordsAdded: string[]; wordsNotAdded: string[]} {
        const { serverId } = server;
        const words = this.args.map((word) => word.toLowerCase());
        const res = server.messageCheckerSettings.addBannedWords(serverId, words);
        return res;
    }
}
