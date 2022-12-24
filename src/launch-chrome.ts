import * as tmp from 'tmp-promise'
import open from 'open'

export const launchChrome = async (
  url: string,
  port: number,
  caFingerprint: string
) => {
  const profileDir = await tmp.dir({ unsafeCleanup: true })

  const platforms: Partial<Record<NodeJS.Platform, string>> = {
    darwin: 'google chrome canary',
    linux: 'google-chrome',
    win32: 'chrome',
  }
  // Launch the browser, using this proxy & trusting our CA certificate:
  await open(url, {
    app: {
      name: platforms[process.platform],
      arguments: [
        `--proxy-server=localhost:${port}`,
        `--ignore-certificate-errors-spki-list=${caFingerprint}`,
        `--user-data-dir=${profileDir.path}`,
        '--no-first-run',
      ],
    } as open.App,
  })
}
