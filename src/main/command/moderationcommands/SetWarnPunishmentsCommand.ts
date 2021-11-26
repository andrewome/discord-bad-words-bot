import {
    Permissions, MessageEmbed,
} from 'discord.js';
import { Command } from '../Command';
import { CommandResult } from '../classes/CommandResult';
import { CommandArgs } from '../classes/CommandArgs';
import { ModUtils } from '../../modules/moderation/ModUtil';
import { ModActions } from '../../modules/moderation/classes/ModActions';
import { ModDbUtils } from '../../modules/moderation/ModDbUtils';

export class SetWarnPunishmentsCommand extends Command {
    public static readonly NAME = 'SetWarnPunishments';

    public static readonly DESCRIPTION = 'Sets Warn threshold punishments';

    /** CheckMessage: true */
    private COMMAND_SUCCESSFUL_COMMANDRESULT: CommandResult = new CommandResult(true);

    private args: string[];

    private permissions = new Permissions(['KICK_MEMBERS', 'BAN_MEMBERS']);

    public static COMMAND_USAGE = '**Usage:** @bot SetWarnPunishments [numWarns-{MUTE|BAN}[-X{m|h|d}] ...]';

    public static INVALID_USAGE = 'Error parsing the input. Try again.';

    public static SETTINGS_RESETTED = 'Warn punishments resetted because there were no arguments.';

    public static EMBED_TITLE = 'Warn Punishments';

    public constructor(args: string[]) {
        super();
        this.args = args;
    }

    /**
     * This function sets the warn-actions in the database
     * It dictates the punishment the user will get after certain amount of warns.
     *
     * @param  {CommandArgs} commandArgs
     * @returns CommandResult
     */
    public async execute(commandArgs: CommandArgs): Promise<CommandResult> {
        const {
            server, memberPerms, messageReply,
        } = commandArgs;

        // Check for permissions first
        if (!this.hasPermissions(this.permissions, memberPerms)) {
            await this.sendNoPermissionsMessage(messageReply);
            return this.NO_PERMISSIONS_COMMANDRESULT;
        }

        // Check number of args, 0 args means reset.
        if (this.args.length === 0) {
            await messageReply({ embeds: [this.generateResetEmbed()] });
            ModDbUtils.resetWarnSettings(server.serverId);
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        // Parse args
        const settings = this.parseArgs(this.args);
        if (!settings) {
            await messageReply({ embeds: [this.generateInvalidUsageEmbed()] });
            return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
        }

        ModDbUtils.resetWarnSettings(server.serverId);
        this.addToDatabase(server.serverId, settings);
        await messageReply({ embeds: [this.generateValidEmbed(settings)] });

        return this.COMMAND_SUCCESSFUL_COMMANDRESULT;
    }

    /**
     * This function adds the parsed args into the database.
     *
     * @param  {string} serverId
     * @param  {[number, ModActions, number][]} settings
     * @returns void
     */
    private addToDatabase(serverId: string, settings: [number, ModActions, number|null][]): void {
        for (const setting of settings) {
            const [numWarns, action, duration] = setting;
            ModDbUtils.addWarnSettings(serverId, numWarns, action, duration);
        }
    }

    /**
     * Parse arguments. Returns null if any of the arguments are malformed.
     *
     * @param  {string[]} args
     * @returns [number, ModActions, number][] | null
     */
    private parseArgs(args: string[]): [number, ModActions, number|null][] | null {
        const out: [number, ModActions, number|null][] = [];
        const numWarnsUsed = new Set<number>();
        for (const arg of args) {
            const splittedArg = arg.split('-');
            // Check length
            if (splittedArg.length < 2 || splittedArg.length > 3)
                return null;

            // Check numWarns. Lesser than 1 is invalid.
            const numWarns = parseInt(splittedArg[0], 10);
            if (Number.isNaN(numWarns) || numWarns < 1)
                return null;

            // Check if numWarns is unique.
            if (numWarnsUsed.has(numWarns))
                return null;
            numWarnsUsed.add(numWarns);

            // Check ModActions.
            const actionStr = splittedArg[1].toUpperCase();
            let action: ModActions;
            if (!(actionStr === ModActions.MUTE || actionStr === ModActions.BAN)) {
                return null;
            }
            if (actionStr === ModActions.MUTE)
                action = ModActions.MUTE;
            else
                action = ModActions.BAN;

            // Check duration
            // If args length = 2, set duration to null (which means forever)
            if (splittedArg.length === 2) {
                out.push([numWarns, action, null]);
                continue;
            }

            const duration = ModUtils.parseDuration(splittedArg[2]);
            if (!duration)
                return null;
            out.push([numWarns, action, duration]);
        }
        return out;
    }

    private generateValidEmbed(settings: [number, ModActions, number|null][]): MessageEmbed {
        let out = '';
        for (const setting of settings) {
            const [numWarns, action, duration] = setting;
            out += `${numWarns} warns - ${action} `;
            out += (duration ? `${Math.floor(duration / 60)} minutes\n` : 'forever\n');
        }

        return this.generateGenericEmbed(
            SetWarnPunishmentsCommand.EMBED_TITLE,
            out,
            SetWarnPunishmentsCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateResetEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            SetWarnPunishmentsCommand.EMBED_TITLE,
            `${SetWarnPunishmentsCommand.SETTINGS_RESETTED}\n${SetWarnPunishmentsCommand.COMMAND_USAGE}`,
            SetWarnPunishmentsCommand.EMBED_DEFAULT_COLOUR,
        );
    }

    private generateInvalidUsageEmbed(): MessageEmbed {
        return this.generateGenericEmbed(
            SetWarnPunishmentsCommand.EMBED_TITLE,
            `${SetWarnPunishmentsCommand.INVALID_USAGE}\n${SetWarnPunishmentsCommand.COMMAND_USAGE}`,
            SetWarnPunishmentsCommand.EMBED_DEFAULT_COLOUR,
        );
    }
}
