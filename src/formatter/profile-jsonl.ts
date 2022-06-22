import { SummaryFormatter, formatterHelpers, Status } from '@cucumber/cucumber';
import { IFormatterOptions } from '@cucumber/cucumber/lib/formatter';
import * as messages from '@cucumber/messages';
import { scenarioDurationMs } from '../durations';

export default class ProfileJsonlFormatter extends SummaryFormatter {
  constructor(options: IFormatterOptions) {
    super(options);
    options.eventBroadcaster.on('envelope', ({ testCaseFinished }) => {
      if (testCaseFinished) {
        this.logTestCaseFinished(testCaseFinished);
      }
    });
  }
  public logTestCaseFinished(
    testCaseFinished: messages.TestStepFinished,
  ): void {
    const testCaseAttempt = this.eventDataCollector.getTestCaseAttempt(
      testCaseFinished.testCaseStartedId,
    );
    const {
      gherkinDocument,
      worstTestStepResult: { status, willBeRetried },
    } = testCaseAttempt;

    const parsed = formatterHelpers.parseTestCaseAttempt({
      cwd: this.cwd,
      snippetBuilder: this.snippetBuilder,
      supportCodeLibrary: this.supportCodeLibrary,
      testCaseAttempt,
    });
    const { uri: filename, line } = parsed.testCase.sourceLocation ?? {
      uri: '<unknown>',
      line: -1,
    };

    const feature = gherkinDocument.feature?.name ?? '<Empty>';
    const scenario = parsed.testCase.name;
    const durationMs = scenarioDurationMs(parsed);

    this.log(
      JSON.stringify({
        status: Status[status],
        durationMs,
        filename,
        scenario,
        line,
        feature,
        willBeRetried,
      }),
    );
  }
}
