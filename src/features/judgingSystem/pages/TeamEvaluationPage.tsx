import {
  LoadingPage,
  ErrorScreen,
  Button,
  TextAreaField,
  Checkbox,
} from "tccd-ui";
import UseTeamEvaluationUtils from "../utils/TeamEvaluationUtils";
import { HTMLFormattedText } from "@/shared/components/HTMLFormattedText";

export default function TeamEvaluationPage() {
  const {
    questions,
    isFetchingData,
    teamData,
    event,
    isFetchingError,
    assessmentScores,
    handleNavigateBack,
    handleChangeAssessmentScore,
    handleSubmitEvaluation,
    handleChangeTeamAttendance,
    handleToggleAllAttendance,
    teamAttendance,
    isSubmittingEvaluation,
    formErrors,
    extraNotes,
    setExtraNotes,
  } = UseTeamEvaluationUtils();

  if (isFetchingData) {
    return <LoadingPage />;
  }

  if (isFetchingError || !questions || !event || !teamData) {
    return (
      <ErrorScreen
        message="Failed to load questions, please try again later."
        title="Failed to fetch data"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-page-gradient-start via-page-gradient-middle to-page-gradient-end text-text-body-main transition-colors duration-500 pb-10 pt-4">
      <div className="xl:w-[45%] lg:w-[58%] md:w-[70%] sm:w-[80%] w-[94%] mx-auto rounded-lg bg-surface-glass-bg shadow-md relative top-4">
        <img
          src="/banner.png"
          alt="TCCD Banner"
          className="w-full h-24 md:h-32 lg:h-[130px] xl:h-[150px] object-fill rounded-lg mb-3"
        />
        <div className="space-y-3 rounded-lg border-t-10 border-primary p-4 shadow-md bg-surface-glass-bg">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">
            {event?.title}'s Evaluation Form
          </h1>
          <p className="text-[14px] md:text-[15px] lg:text-[16px] text-text-muted-foreground">
            Please fill in all the following fields according to the{" "}
            <strong className="text-[16px] md:text-[17px] lg:text-[18px]">
              {teamData?.name}
            </strong>
            's performance on each point.
            <br />
            Each score should be a <strong>Decimal</strong> between{" "}
            <strong>0</strong> and <strong>10</strong>.
          </p>
          <div className="flex gap-1 items-center text-[16px] md:text-[18px] lg:text-[20px] text-text-muted-foreground font-semibold">
            Team Name: <p className="text-text-body-main">{teamData?.name}</p>
          </div>
          {formErrors?.name && (
            <div className="text-primary -mt-1 lg:text-[15px] md:text-[14px] text-[13px]">
              {formErrors.name}
            </div>
          )}
          <hr className="border-text-body-main/30" />

          <div className="space-y-3 flex-col flex">
            <div className="flex justify-between items-center">
              <div className="text-[18px] md:text-[19px] lg:text-[20px] font-semibold text-text-title">
                a) Team Attendance
              </div>
              <Button
                type="tertiary"
                buttonText={
                  teamData.teamMembers?.every(
                    (member) =>
                      teamAttendance.find(
                        (att) => att.teamMemberId === member.id
                      )?.attended
                  )
                    ? "Deselect All"
                    : "Select All"
                }
                onClick={handleToggleAllAttendance}
                width="fit"
              />
            </div>
            {teamData.teamMembers &&
              teamData.teamMembers.length > 0 &&
              teamData.teamMembers.map((member, index) => (
                <Checkbox
                  key={index}
                  label={member.name}
                  checked={
                    !!teamAttendance.find(
                      (att) => att.teamMemberId === member.id
                    )?.attended
                  }
                  onChange={() =>
                    handleChangeTeamAttendance(
                      member.id,
                      !teamAttendance.find(
                        (att) => att.teamMemberId === member.id
                      )?.attended
                    )
                  }
                />
              ))}
          </div>

          <hr className="my-3 border-surface-glass-border/10" />
          <div className="space-y-2 flex-col flex">
            <div className="text-[18px] md:text-[19px] lg:text-[20px] font-semibold mb-4 text-text-title">
              b) Team Evaluation
            </div>
            {questions.map((question, index) => (
              <div
                key={index}
                className="mb-4 last:mb-0 border border-surface-glass-border/20 p-2 rounded-lg bg-surface-glass-border/5"
              >
                <div className="flex gap-1 lg:text-[16px] md:text-[15px] text-[14px]">
                  <p className="font-semibold text-primary">
                    {question.itemNumber}.
                  </p>
                  <p className="text-text-body-main font-medium">
                    {question.name}
                  </p>
                </div>
                <p className="text-text-body-main md:text-[15px] text-[14px] mt-1">
                  <HTMLFormattedText content={question.description} />
                </p>
                <div className="flex gap-2 mt-2 items-center">
                  <p className="text-text-body-main lg:text-[17px] md:text-[16px] text-[15px]">
                    Score:
                  </p>
                  <div className="flex gap-1 items-center">
                    <input
                      placeholder="0"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="shadow-md bg-surface-glass-bg rounded-lg text-center focus:border-primary border-surface-glass-border/20 border transition-colors duration-200 outline-none text-text-body-main w-16 h-[27px] px-2"
                      value={
                        assessmentScores[question.id] === -1
                          ? ""
                          : assessmentScores[question.id]
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          handleChangeAssessmentScore(question.id, -1);
                          return;
                        }
                        if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                          handleChangeAssessmentScore(question.id, val as any);
                        }
                      }}
                    />
                    <p className="text-primary font-semibold text-[17px] md:text-[18px]">
                      / 10.0
                    </p>
                  </div>
                </div>
                {formErrors?.questions[question.id] && (
                  <div className="text-primary mt-2 lg:text-[15px] md:text-[14px] text-[13px]">
                    {formErrors.questions[question.id]}
                  </div>
                )}
              </div>
            ))}
            <TextAreaField
              id="additionalComments"
              label="Additional Comments (Optional)"
              placeholder="Provide any additional comments regarding the team's performance..."
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
            />
          </div>

          <hr className="border-text-body-main/30" />
          <div className="flex gap-2 justify-center items-center">
            <Button
              disabled={isSubmittingEvaluation}
              type="secondary"
              onClick={() => handleNavigateBack()}
              buttonText="Cancel"
            />
            <Button
              loading={isSubmittingEvaluation}
              type="primary"
              onClick={() => handleSubmitEvaluation()}
              buttonText="Submit"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
