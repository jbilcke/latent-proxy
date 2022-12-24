import { Configuration, ConfigurationParameters, OpenAIApi } from 'openai'
import { openAIModel } from '../../config'
import { PromptConfig } from '../../types'
import { DalleImage } from './types'

const getClient = (config: PromptConfig) => {
  const configuration = new Configuration(config)
  const openai = new OpenAIApi(configuration)
  return openai
}

export const imagineString = async (
  prompt: string,
  config: PromptConfig
): Promise<string> => {
  console.log('prompt:', prompt)

  const openai = getClient(config)

  const response = await openai.createCompletion({
    model: openAIModel,
    prompt,
    user: config.user,
    temperature: 0.8,
    max_tokens: 2500,
    top_p: 1,
    // best_of: 2,
    frequency_penalty: 0,
    presence_penalty: 0,
    // stop: [stop],
  })

  return response?.data?.choices?.[0]?.text?.trim() || ''
}

export const imagineHTML = async (
  prompt: string,
  config: PromptConfig
): Promise<string> => {
  const output = await imagineString(prompt, config)

  // we don't care about hallucinated image src
  const html = output.replace(/src="[^"]+/g, 'src="')

  return html
}

export const imagineJSON = async <T>(
  prompt: string,
  defaultValue: T,
  config: PromptConfig
): Promise<T> => {
  let output = await imagineString(prompt, config)

  try {
    // we give a hint in our prompt by prefixing it with [ but we need to put it back in the output
    const raw = `[${output}`

    // try to fix GPT-3 adding commas at the end of each line
    const regex = /\,(?!\s*?[\{\[\"\'\w])/g
    const input = raw.replace(regex, '')
    console.log(`input: ${input}`)

    const json = JSON.parse(input) as T

    // remove all trailing commas (`input` variable holds the erroneous JSON)
    console.log('success!', json)
    if (json === null || typeof json === undefined) {
      throw new Error("couldn't parse JSON")
    }
    return json
  } catch (err) {
    console.log('error!', err)
    return defaultValue
  }
}

export const getImage = async (
  prompt: string,
  config: PromptConfig
): Promise<DalleImage> => {
  const openai = getClient(config)

  // DallE 2 only supports squares
  // Must be one of 256x256, 512x512, or 1024x1024.
  const size = 1024 // 1024
  const width = size
  const height = size
  const response = await openai.createImage({
    prompt,
    n: 1,
    size: `${width}x${height}`,
  })

  return {
    url: response.data.data[0].url || '',
    prompt,
    width,
    height,
  }
}
