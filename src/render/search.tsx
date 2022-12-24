import React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import { searchTemplate } from '../engine/prompts/search'
import { imagineJSON } from '../providers/openai'

export const renderSearch = async (query: string = ''): Promise<string> => {
  console.log('rendering query: ', query)

  /*
  const results = await imagineJSON(searchTemplate(query, 10), [], {
    apiKey: '',
  })
  */

  const response = ReactDOMServer.renderToString(
    <html>
      <body>
        <div>Hello, React World! You searched for {query}</div>
      </body>
    </html>
  )

  console.log('response:', response)

  return response
}
