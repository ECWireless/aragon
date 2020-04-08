import React from 'react'
import { Link, textStyle, GU, LoadingRing } from '@aragon/ui'
import PropTypes from 'prop-types'
import { AppType } from '../../prop-types'
import { shortenAddress } from '../../web3-utils'

export default function ConsoleFeedback({
  currentParsedCommand,
  handleCommandClick,
  apps,
  loading,
}) {
  function handleClick(command) {
    handleCommandClick(command)
  }
  if (loading) {
    return (
      <div
        css={`
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${GU * 6}px 0 ${GU * 6}px 0;
        `}
      >
        <LoadingRing />
        <span
          css={`
            margin-left: ${1 * GU}px;
            ${textStyle('body2')}
          `}
        >
          Executing Command...
        </span>
      </div>
    )
  }
  if (currentParsedCommand.length < 2) {
    return (
      <>
        <p
          css={`
            ${textStyle('body2')}
          `}
        >
          You can interact with this organization by using the following CLI
          commands:
        </p>
        <div
          css={`
            width: 100%;
            margin-top: ${GU}px;
          `}
        >
          {['Exec', 'Act'].map(command => (
            <Link
              key={command}
              css={`
                ${textStyle('address1')}
                display: block;
                margin-bottom: ${GU}px;
              `}
              onClick={() => handleClick(command)}
            >
              {command}
            </Link>
          ))}
        </div>
      </>
    )
  } else if (
    currentParsedCommand[0] === 'install' &&
    currentParsedCommand.length < 3
  ) {
    return (
      <>
        <p
          css={`
            ${textStyle('body2')}
          `}
        >
          You can install the following apps:
        </p>
        <div
          css={`
            width: 100%;
            margin-top: ${GU}px;
          `}
        >
          {['Tokens', 'Voting', 'Finance', 'Vault', 'Agent'].map(command => (
            <Link
              key={command}
              css={`
                ${textStyle('address1')}
                display: block;
                margin-bottom: ${GU}px;
              `}
              onClick={() => handleClick(command.toLowerCase())}
            >
              {command}
            </Link>
          ))}
        </div>
      </>
    )
  } else if (
    currentParsedCommand[0] === 'install' &&
    currentParsedCommand.length >= 3
  ) {
    return (
      <>
        <p
          css={`
            ${textStyle('body2')}
          `}
        >
          Please enter the corresponding parameters &amp; permissions needed for
          installing the app, ex:
        </p>
        <div
          css={`
            width: 100%;
            margin-top: ${GU}px;
            margin-bottom: ${GU}px;
          `}
        >
          <p
            css={`
              ${textStyle('address1')}
            `}
          >
            install/app/
            {`(...initparams)/...PERMISSION_ROLE:ADDRESS_MANAGER:ADDRESS_GRANTEE`}
          </p>
        </div>
        <p
          css={`
            ${textStyle('body2')}
          `}
        >
          You can set multiple permissions by separating them with a comma.
        </p>
      </>
    )
  } else if (
    currentParsedCommand[0] === 'exec' &&
    currentParsedCommand.length < 3
  ) {
    return (
      <>
        <p
          css={`
            ${textStyle('body2')}
          `}
        >
          You can interact with the following apps:
        </p>
        <div
          css={`
            width: 100%;
            margin-top: ${GU}px;
            overflow: hidden;
            text-overflow: ellipsis;
          `}
        >
          {apps.map(app => (
            <Link
              key={app.proxyAddress}
              css={`
                ${textStyle('address1')}
                display: block;
                margin-bottom: ${GU}px;
              `}
              onClick={() => handleClick(app.proxyAddress)}
            >
              <span>{app.name}</span> (
              <span title={app.proxyAddress}>
                {shortenAddress(app.proxyAddress)}
              </span>
              )
            </Link>
          ))}
        </div>
      </>
    )
  } else if (
    currentParsedCommand[0] === 'exec' &&
    currentParsedCommand.length >= 3
  ) {
    return (
      <>
        <p
          css={`
            ${textStyle('body2')}
          `}
        >
          Please enter the corresponding method &amp; arguments needed for
          interacting with the app, like so:
        </p>
        <div
          css={`
            width: 100%;
            margin-top: ${GU}px;
            margin-bottom: ${GU}px;
          `}
        >
          <p
            css={`
              ${textStyle('address1')}
            `}
          >
            exec/appAddress/
            {`methodName(...args)`}
          </p>
        </div>
      </>
    )
  } else if (
    currentParsedCommand[0] === 'act' &&
    currentParsedCommand.length <= 2
  ) {
    const agentInstalled =
      apps.filter(app => app.name.toLowerCase() === 'agent').length > 0
    if (!agentInstalled) {
      return (
        <>
          <p
            css={`
            ${textStyle('body2')}
            margin: 0 0 ${GU}px 0;
          `}
          >
            There are no Agent instances installed in this organization. Please
            read{' '}
            <Link
              external
              href="https://hack.aragon.org/docs/cli-dao-commands#dao-install"
            >
              the documentation
            </Link>{' '}
            on how to install an Agent using the CLI, or go to our{' '}
            <Link external href="https://spectrum.chat/aragon">
              Discord
            </Link>{' '}
            server to help you install it.
          </p>
        </>
      )
    }
    return (
      <>
        <p
          css={`
            ${textStyle('body2')}
            margin: 0 0 ${GU}px 0;
          `}
        >
          Please select the corresponding agent instance you want to interact
          with:
        </p>
        {apps
          .filter(app => app.name.toLowerCase() === 'agent')
          .map((agentApp, index) => (
            <Link
              key={agentApp.proxyAddress}
              css={`
                ${textStyle('address1')}
                display: block;
                margin-bottom: ${GU}px;
              `}
              onClick={() => handleClick(agentApp.proxyAddress)}
            >
              Agent #{index + 1} ({shortenAddress(agentApp.proxyAddress)})
            </Link>
          ))}
      </>
    )
  } else if (
    currentParsedCommand[0] === 'act' &&
    currentParsedCommand.length >= 2
  ) {
    return (
      <>
        <p css={`${textStyle('body2')} margin: 0 0 ${GU}px 0;`}>
          Pass the paremeters required for the Agent's execute function: the
          target address, and the human-readable function call, in the format
          shown below:
        </p>

        <div
          css={`
            width: 100%;
            margin-top: ${GU}px;
            margin-bottom: ${GU}px;
          `}
        >
          <p
            css={`
              ${textStyle('address1')}
            `}
          >
            act/{'<agentProxyAddress>'}/{'targetAddress'}/
            {`methodName(type: arg)`}
          </p>
        </div>
      </>
    )
  }
  return (
    <p
      css={`
        ${textStyle('address1')}
      `}
    >
      Unrecognized Command
    </p>
  )
}

ConsoleFeedback.propTypes = {
  currentParsedCommand: PropTypes.array,
  handleCommandClick: PropTypes.func,
  apps: PropTypes.arrayOf(AppType).isRequired,
  loading: PropTypes.bool,
}
