import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { decode, verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'

const jwksClient = require('jwks-rsa')({
  jwksUri: 'https://udacity-frontendtony.us.auth0.com/.well-known/jwks.json',
  requestHeaders: {}, // Optional
  timeout: 30000 // Defaults to 30s
})

const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    logger.info('Verifying token...')

    const token = getToken(authHeader)

    logger.info(`Token retrieved ${token}`)

    const jwt = decode(token, { complete: true })

    logger.info(`Token decoded ${JSON.stringify(jwt)}`)

    const requestKid = jwt.header.kid

    const key = await jwksClient.getSigningKey(requestKid)
    const signingKey = key.getPublicKey()

    logger.info(`Retrieved signing key ${JSON.stringify(signingKey)}`)

    return verify(token, signingKey, { algorithms: ['RS256'] }) as JwtPayload
  } catch (error: any) {
    throw new Error(`Failed to verify token, ${error?.message}`)
  }
}

function getToken(authHeader: string): string {
  logger.info('Retrieving token...')
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

// interface JwkKey {
//   alg: string
//   kty: string
//   use: string
//   n: string
//   e: string
//   kid: string
//   x5t: string
//   x5c: string[]
// }
