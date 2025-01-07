export function initCommands(): void;

declare global {
  namespace Cypress {
    interface Chainable {
      toMatchSnapshot(
        options?: Partial<{
          ignoreExtralFields: boolean;
          ignoreExtraArrayItems: boolean;
          normalizeJson: boolean;
          replace: any;
          name: string;
        }>
      ): Chainable<null>;

      toMatchImageSnapshot(
        options?: Partial<{
          imageConfig: Partial<{
            createDiffImage: boolean;
            threshold: number;
            thresholdType: 'percent' | 'pixels';
            resizeDevicePixelRatio: boolean;
          }>;
          screenshotConfig: Partial<ScreenshotDefaultsOptions>;
          name: string;
          separator: string;
        }>
      ): Chainable<null>;
    }
  }
}
