import * as mockttp from 'mockttp'
import url from 'node:url'
import { launchChrome } from './launch-chrome'
import { renderSearch } from './render/search'

const main = async () => {
  // Create a proxy server with a self-signed HTTPS CA certificate:
  const https = await mockttp.generateCACertificate()
  const server = mockttp.getLocal({ https })

  // Inject 'Hello world' responses for all requests
  await server.forAnyRequest().thenCallback(async (request) => {
    // console.log(request)
    console.log(request.url)

    // console.log('> headers:', request.headers)
    // console.log('> path:', request.path)

    let query = ''
    try {
      const rawQuery = url.parse(request.url, true).query
      console.log('rawQuery:', rawQuery)
      query = `${rawQuery.search || ''}`
    } catch (err) {
      console.log(err)
    }

    console.log('query:', query)

    // const params = new URLSearchParams(window.location.search)

    const body = query ? await renderSearch(query) : `fail`

    return {
      statusCode: 200,
      headers: {
        'Content-type': 'text/html',
      },

      body,

      // this will be used for AI services
      // json: { hello: 'world' },
    }
  })

  await server.start()

  const caFingerprint = mockttp.generateSPKIFingerprint(https.cert)

  if (process.argv[2] === 'chrome') {
    // Launch an intercepted Chrome using this proxy:
    launchChrome('https://example.com', server.port, caFingerprint)
  } else {
    // Print out the server details for manual configuration:
    console.log(`Server running on port ${server.port}`)
    console.log(`CA cert fingerprint ${caFingerprint}`)
  }
}

main()
