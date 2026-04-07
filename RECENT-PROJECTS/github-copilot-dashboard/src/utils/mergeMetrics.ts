// @ts-nocheck

export function mergeMetricDays(allDays: any[][]): any[] {
    const map = new Map<string, any>();

    for (const teamDays of allDays) {
        for (const day of teamDays) {
            if (!map.has(day.date)) {
                map.set(day.date, JSON.parse(JSON.stringify(day)));
            } else {
                const target = map.get(day.date)!;
                target.total_active_users += day.total_active_users || 0;
                target.total_engaged_users += day.total_engaged_users || 0;

                // merge code completions
                if (day.copilot_ide_code_completions?.editors) {
                    if (!target.copilot_ide_code_completions) target.copilot_ide_code_completions = { editors: [] };
                    for (const ed of day.copilot_ide_code_completions.editors) {
                        let tgtEd = target.copilot_ide_code_completions.editors!.find((e: any) => e.name === ed.name);
                        if (!tgtEd) {
                            tgtEd = JSON.parse(JSON.stringify(ed));
                            target.copilot_ide_code_completions.editors!.push(tgtEd);
                        } else {
                            tgtEd.total_engaged_users += ed.total_engaged_users || 0;
                            for (const mod of ed.models || []) {
                                let tgtMod = tgtEd.models?.find((m: any) => m.name === mod.name);
                                if (!tgtMod) {
                                    if (!tgtEd.models) tgtEd.models = [];
                                    tgtEd.models.push(JSON.parse(JSON.stringify(mod)));
                                } else {
                                    tgtMod.total_engaged_users += mod.total_engaged_users || 0;
                                    for (const lang of mod.languages || []) {
                                        let tgtLang = tgtMod.languages?.find((l: any) => l.name === lang.name);
                                        if (!tgtLang) {
                                            if (!tgtMod.languages) tgtMod.languages = [];
                                            tgtMod.languages.push(JSON.parse(JSON.stringify(lang)));
                                        } else {
                                            tgtLang.total_engaged_users += lang.total_engaged_users || 0;
                                            tgtLang.total_code_suggestions += lang.total_code_suggestions || 0;
                                            tgtLang.total_code_acceptances += lang.total_code_acceptances || 0;
                                            tgtLang.total_code_lines_suggested += lang.total_code_lines_suggested || 0;
                                            tgtLang.total_code_lines_accepted += lang.total_code_lines_accepted || 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // merge ide chat
                if (day.copilot_ide_chat?.editors) {
                    if (!target.copilot_ide_chat) target.copilot_ide_chat = { total_engaged_users: 0, editors: [] };
                    target.copilot_ide_chat.total_engaged_users += day.copilot_ide_chat.total_engaged_users || 0;
                    for (const ed of day.copilot_ide_chat.editors) {
                        let tgtEd = target.copilot_ide_chat.editors!.find((e: any) => e.name === ed.name);
                        if (!tgtEd) {
                            tgtEd = JSON.parse(JSON.stringify(ed));
                            target.copilot_ide_chat.editors!.push(tgtEd);
                        } else {
                            tgtEd.total_engaged_users += ed.total_engaged_users || 0;
                            for (const mod of ed.models || []) {
                                let tgtMod = tgtEd.models?.find((m: any) => m.name === mod.name);
                                if (!tgtMod) {
                                    if (!tgtEd.models) tgtEd.models = [];
                                    tgtEd.models.push(JSON.parse(JSON.stringify(mod)));
                                } else {
                                    tgtMod.total_chats += mod.total_chats || 0;
                                    tgtMod.total_engaged_users += mod.total_engaged_users || 0;
                                }
                            }
                        }
                    }
                }

                // merge dotcom chat
                if (day.copilot_dotcom_chat?.models) {
                    if (!target.copilot_dotcom_chat) target.copilot_dotcom_chat = { total_engaged_users: 0, models: [] };
                    target.copilot_dotcom_chat.total_engaged_users += day.copilot_dotcom_chat.total_engaged_users || 0;
                    for (const mod of day.copilot_dotcom_chat.models) {
                        let tgtMod = target.copilot_dotcom_chat.models!.find((m: any) => m.name === mod.name);
                        if (!tgtMod) {
                            tgtMod = JSON.parse(JSON.stringify(mod));
                            target.copilot_dotcom_chat.models!.push(tgtMod);
                        } else {
                            tgtMod.total_chats += mod.total_chats || 0;
                            tgtMod.total_engaged_users += mod.total_engaged_users || 0;
                        }
                    }
                }

                // merge pr
                if (day.copilot_dotcom_pull_requests?.repositories) {
                    if (!target.copilot_dotcom_pull_requests) target.copilot_dotcom_pull_requests = { total_engaged_users: 0, repositories: [] };
                    target.copilot_dotcom_pull_requests.total_engaged_users += day.copilot_dotcom_pull_requests.total_engaged_users || 0;
                    for (const rep of day.copilot_dotcom_pull_requests.repositories) {
                        let tgtRep = target.copilot_dotcom_pull_requests.repositories!.find((r: any) => r.name === rep.name);
                        if (!tgtRep) {
                            tgtRep = JSON.parse(JSON.stringify(rep));
                            target.copilot_dotcom_pull_requests.repositories!.push(tgtRep);
                        } else {
                            tgtRep.total_engaged_users += rep.total_engaged_users || 0;
                            for (const mod of rep.models || []) {
                                let tgtMod = tgtRep.models?.find((m: any) => m.name === mod.name);
                                if (!tgtMod) {
                                    if (!tgtRep.models) tgtRep.models = [];
                                    tgtRep.models.push(JSON.parse(JSON.stringify(mod)));
                                } else {
                                    tgtMod.total_pr_summaries_created += mod.total_pr_summaries_created || 0;
                                    tgtMod.total_engaged_users += mod.total_engaged_users || 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
