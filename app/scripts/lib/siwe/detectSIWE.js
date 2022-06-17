import { stripHexPrefix } from 'ethereumjs-util';
import { ParsedMessage } from '@spruceid/siwe-parser';
import log from 'loglevel';

const msgHexToText = (hex) => {
  try {
    const stripped = stripHexPrefix(hex);
    const buff = Buffer.from(stripped, 'hex');
    return buff.length === 32 ? hex : buff.toString('utf8');
  } catch (e) {
    log.error(e);
    return hex;
  }
};

/**
 * A locally defined object used to provide data to identify a Sign-In With Ethereum (SIWE)(EIP-4361) message and provide the parsed message
 *
 * @typedef localSIWEObject
 * @param {bool} isSIWEMessage - Does the intercepted message conform to the SIWE specification?
 * @param {bool} isSIWEDomainValid - Does the domain in the SIWE message match the domain the message is coming from?
 * @param {bool} isMatchingAddress - Does the address in the SIWE message match the account being requested to sign?
 * @param {ParsedMessage} parsedMessage - The data parsed out of the message
 */

/**
 * This function intercepts a sign message, detects if it's a
 * Sign-In With Ethereum (SIWE)(EIP-4361) message, and returns an object with
 * relevant SIWE data.
 *
 * {@see {@link https://eips.ethereum.org/EIPS/eip-4361}}
 *
 * @param {Object} msgParams - The params of the message to sign
 * @returns {localSIWEObject}
 */
const detectSIWE = (msgParams) => {
  try {
    const { data, from, origin = null } = msgParams;
    const message = msgHexToText(data);
    const parsedMessage = new ParsedMessage(message);
    const isMatchingAddress = from === parsedMessage.address;
    let isSIWEDomainValid = false;

    if (origin) {
      const { host } = new URL(origin);
      isSIWEDomainValid = parsedMessage.domain === host;
    }

    return {
      isSIWEMessage: true,
      isSIWEDomainValid,
      isMatchingAddress,
      parsedMessage,
    };
  } catch (error) {
    // ignore error, it's not a valid SIWE message
    return {
      isSIWEMessage: false,
      isSIWEDomainValid: false,
      isMatchingAddress: false,
      parsedMessage: null,
    };
  }
};
export default detectSIWE;
