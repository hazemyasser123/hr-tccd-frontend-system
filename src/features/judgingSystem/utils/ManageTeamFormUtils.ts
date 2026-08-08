import { useEffect, useState } from "react";
import type { Team } from "@/shared/types/judgingSystem";
import { useCreateTeam, useUpdateTeam } from "@/shared/queries/judgingSystem/judgeQueries";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import DEPARTMENT_LIST from "@/constants/departments";

export default function useManageTeamModalUtils (eventId: string, mode: number, teamData: Team | undefined) {
    const [teamDataState, setTeamDataState] = useState<Team | undefined>({id: "", name: "", code: "", course: "", department: "", teamMembers: [], evaluated: false});
    const [formErrors, setFormErrors] = useState<{attr: string, value:string}[]>([]);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [uploadError, setUploadError] = useState<string>("");
    const [uploadedTeams, setUploadedTeams] = useState<Team[]>([]);
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(0);
    
    const createTeamMutation = useCreateTeam();
    const updateTeamMutation = useUpdateTeam();
    const isLoading = createTeamMutation.isPending || updateTeamMutation.isPending;

    useEffect(() => {
        if(mode == 2 && teamData) {
            setTeamDataState(teamData);
        }
    }, [teamData]);

    const validateTeamData = (): {attr: string, value:string}[] => {
        const errors: {attr: string, value:string}[] = [];

        if (!teamDataState?.name || teamDataState.name.trim() === "") errors.push({attr: "name", value: "Team name is required."});
        if (!teamDataState?.code || teamDataState.code.trim() === "") errors.push({attr: "code", value: "Team Code is required."});
        if (!teamDataState?.course || teamDataState.course.trim() === "") errors.push({attr: "course", value: "Team Course is required"});
        if (!teamDataState?.department || teamDataState.department.trim() === "") errors.push({attr: "department", value: "Team Department is required"});
        if (!teamDataState?.teamMembers || teamDataState.teamMembers.length === 0) errors.push({attr: "teamMembers", value: "Team Must include at least 1 member."});
        return errors;
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessingFile(true);
        setUploadError("");

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: "array" });
            
            // Get the first sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            if (jsonData.length < 2) {
                setUploadError("Excel file is empty or has no data rows.");
                setIsProcessingFile(false);
                return;
            }

            // Get headers (first row)
            const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
            
            // Find column indices
            const nameIndex = headers.findIndex((h: string) => h.toLowerCase().includes("team name") || h.toLowerCase().includes("name"));
            const courseIndex = headers.findIndex((h: string) => h.toLowerCase().includes("course"));
            const codeIndex = headers.findIndex((h: string) => h.toLowerCase().includes("code"));
            const departmentIndex = headers.findIndex((h: string) => h.toLowerCase().includes("department"));
            const membersIndex = headers.findIndex((h: string) => h.toLowerCase().includes("member") || h.toLowerCase().includes("members") || h.toLowerCase().includes("team members"));
            const isEvaluatedIndex = headers.findIndex((h: string) => h.toLowerCase().includes("evaluated"));

            // Validate required columns exist
            if (nameIndex === -1 || courseIndex === -1 || codeIndex === -1 || departmentIndex === -1 || membersIndex === -1) {
                setUploadError("Missing required columns. Please ensure your Excel has: Team Name, Course, Code, Department, and Team Members columns.");
                setIsProcessingFile(false);
                return;
            }

            // Create department lookup map (label -> value)
            const departmentMap = new Map(
                DEPARTMENT_LIST.map(dept => [dept.label.toLowerCase(), dept.value])
            );

            // Parse teams from rows (skip header row)
            const teams: Team[] = [];
            const invalidDepartments: string[] = [];
            
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                
                // Skip empty rows
                if (!row || row.length === 0 || !row[nameIndex]) continue;

                const teamName = String(row[nameIndex] || "").trim();
                const course = String(row[courseIndex] || "").trim();
                const code = String(row[codeIndex] || "").trim();
                const departmentLabel = String(row[departmentIndex] || "").trim();
                const membersStr = String(row[membersIndex] || "").trim();
                const evaluatedStr = String(row[isEvaluatedIndex] || "").trim();
                const evaluated = evaluatedStr ? evaluatedStr.toLowerCase() === "yes" || evaluatedStr.toLowerCase() === "true" : false;

                // Skip rows with empty required fields
                if (!teamName || !course || !code || !departmentLabel) continue;

                // Map department label to value
                const departmentValue = departmentMap.get(departmentLabel.toLowerCase());
                                
                if (!departmentValue) {
                    invalidDepartments.push(`${teamName} (${departmentLabel})`);
                    continue;
                }

                // Parse team members (comma-separated)
                const memberNames = membersStr
                    .split(",")
                    .map((name: string) => name.trim())
                    .filter((name: string) => name.length > 0);

                const teamMembers = memberNames.map((name: string, index: number) => ({
                    id: `${i}-${index}`,
                    name: name
                }));

                teams.push({
                    id: `upload-${i}`,
                    name: teamName,
                    code: code,
                    course: course,
                    department: departmentValue, // Use the mapped value
                    teamMembers: teamMembers,
                    evaluated: evaluated,
                });
            }

            if (invalidDepartments.length > 0) {
                setUploadError(`Invalid departments found: ${invalidDepartments.join(", ")}. Please use exact department names from the dropdown.`);
                setIsProcessingFile(false);
                return;
            }

            if (teams.length === 0) {
                setUploadError("No valid team data found in the Excel file.");
                setIsProcessingFile(false);
                return;
            }

            // Store uploaded teams in state and load the first one into the form
            setUploadedTeams(teams);
            setCurrentUploadIndex(0);
            if (teams.length > 0) {
                setTeamDataState(teams[0]);
                toast.success(`Loaded ${teams.length} team(s) from file. Click Submit to create them.`);
            }
            
            // Reset file input
            event.target.value = "";

        } catch (error) {
            console.error("Error processing file:", error);
            setUploadError("Failed to process Excel file. Please check the file format.");
        } finally {
            setIsProcessingFile(false);
        }
    };

    const submitTeam = () => {
        if (!teamDataState) return;
        
        // Create trimmed team data with properly mapped department
        const trimmedTeamData: Team = {
            id: teamDataState.id,
            name: teamDataState.name.trim(),
            code: teamDataState.code.trim(),
            course: teamDataState.course.trim(),
            department: teamDataState.department.trim(),
            teamMembers: teamDataState.teamMembers.map(mem => ({ ...mem, name: mem.name.trim() })),
            evaluated: teamDataState.evaluated
        };

        // Update state with trimmed data
        setTeamDataState(trimmedTeamData);
        
        // Validate with trimmed data
        const errors = validateTeamData();
        if(errors.length > 0) {
            setFormErrors(errors);
            return;
        }
        
        if(mode === 1) {
            createTeamMutation.mutate({eventId: eventId, teamData: trimmedTeamData }, {
                onSuccess: () => {
                    // Check if there are more uploaded teams to process
                    if (uploadedTeams.length > 0 && currentUploadIndex < uploadedTeams.length - 1) {
                        const nextIndex = currentUploadIndex + 1;
                        setCurrentUploadIndex(nextIndex);
                        setTeamDataState(uploadedTeams[nextIndex]);
                        setFormErrors([]);
                        toast.success(`Team created successfully. Loading next team (${nextIndex + 1}/${uploadedTeams.length})...`);
                    } else {
                        toast.success("Team created successfully.");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                },
                onError: () => {
                    toast.error("Failed to create team, please try again later.")
                }
            });
        } else if (mode === 2) {
            updateTeamMutation.mutate({teamData: trimmedTeamData, oldTeamData: teamData as Team}, {
                onSuccess: () => {
                    toast.success("Team updated successfully.");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                },
                onError: () => {
                    toast.error("Failed to update team, please try again later.")
                }
            });
        }
    }

    const handleChangeTeamData = (attr: keyof Team, value: string) => {
        setTeamDataState((prev : Team | undefined) => prev ? {...prev, [attr]: value} : prev);
    }

    const handleAddMember = () => {
        if (!teamDataState) return;
        const newMember = { id: (teamDataState.teamMembers.length + 1).toString(), name: "" };
        setTeamDataState({ ...teamDataState, teamMembers: [...teamDataState.teamMembers, newMember] });
    }

    const handleChangeMemberName = (memberId: string, newName: string) => {
        if (!teamDataState) return;
        const updatedMembers = teamDataState.teamMembers.map(member => 
            member.id === memberId ? { ...member, name: newName } : member
        );
        setTeamDataState({ ...teamDataState, teamMembers: updatedMembers });
    }

    const handleDeleteMember = (memberId: string) => {
        if (!teamDataState) return;
        const updatedMembers = teamDataState.teamMembers.filter(member => member.id !== memberId);
        setTeamDataState({ ...teamDataState, teamMembers: updatedMembers });
    }

    return {
        teamDataState,
        handleAddMember,
        handleDeleteMember,
        handleChangeMemberName,
        validateTeamData,
        handleChangeTeamData,
        formErrors,
        submitTeam,
        isLoading,
        handleFileUpload,
        isProcessingFile,
        uploadError,
        uploadedTeams,
        currentUploadIndex
    }
}