import React from 'react'
import styled from 'styled-components'
import { SidePanel } from '@aragon/ui'
import { Permissions, Settings } from './apps'
import AppIFrame from './components/App/AppIFrame'
import App404 from './components/App404/App404'
import Home from './components/Home/Home'
import ComingSoon from './components/ComingSoon/ComingSoon'
import MenuPanel from './components/MenuPanel/MenuPanel'
import SignerPanelContent from './components/SignerPanel/SignerPanelContent'
import { getAppPath } from './routing'
import { staticApps } from './static-apps'
import { addressesEqual } from './web3-utils'

class Wrapper extends React.Component {
  static defaultProps = {
    apps: [],
    account: '',
    connected: false,
    daoAddress: '',
    historyBack: () => {},
    historyPush: () => {},
    locator: {},
    walletNetwork: '',
    transactionBag: null,
    wrapper: null,
    walletWeb3: null,
    web3: null,
  }
  state = {
    appInstance: {},
    signerOpened: false,
    web3Action: {},
  }
  componentWillReceiveProps({ transactionBag }) {
    if (transactionBag && transactionBag !== this.props.transactionBag) {
      this.handleTransaction(transactionBag)
    }
  }
  openApp = (instanceId, params) => {
    const { historyPush, locator } = this.props
    historyPush(getAppPath({ dao: locator.dao, instanceId, params }))
  }
  handleAppIFrameRef = appIFrame => {
    this.appIFrame = appIFrame
  }
  handleAppIFrameLoad = event => {
    const {
      apps,
      wrapper,
      locator: { instanceId },
    } = this.props
    if (
      !wrapper ||
      !apps.find(app => addressesEqual(app.proxyAddress, instanceId))
    ) {
      console.error('The app cannot be connected to aragon.js')
      return
    }

    wrapper.connectAppIFrame(event.target, instanceId)
    this.appIFrame.sendMessage({
      from: 'wrapper',
      name: 'ready',
      value: true,
    })
  }
  handleNotificationsClearAll = () => {
    const { wrapper } = this.props
    wrapper && wrapper.clearNotifications()
  }
  handleNotificationNavigation = ({ context, app: instanceId }) => {
    if (this.isAppInstalled(instanceId)) {
      this.openApp(instanceId)
    }
  }
  // params need to be a string
  handleParamsRequest = params => {
    this.openApp(this.props.locator.instanceId, params)
  }
  makeTransactionIntent(transaction = {}) {
    const { apps } = this.props
    const { description, to } = transaction
    const toApp = apps.find(app => addressesEqual(app.proxyAddress, to))
    const toName = (toApp && toApp.name) || ''

    return {
      description,
      to,
      toName,
      transaction,
    }
  }
  reshapeTransactionBag({ path, transaction }) {
    // This is a temporary method to reshape the transaction bag
    // to the future format we expect from Aragon.js
    // When Aragon.js starts returning the new format, we can simply
    // replace search and replace this function with `bag`, although
    // it is probably only used in `handleTransaction`

    return {
      direct: path.length === 1,
      intent: transaction && this.makeTransactionIntent(transaction),
      paths: path.length ? [path] : [],
    }
  }
  handleTransaction = bag => {
    const { intent, direct, paths } = this.reshapeTransactionBag(bag)
    this.showWeb3ActionSigner(intent, { direct, error: null, paths })
  }
  handleSigningWeb3Tx = transaction => {
    const {
      walletWeb3,
      transactionBag: { accept, reject },
    } = this.props

    walletWeb3.eth.sendTransaction(transaction, (err, res) => {
      this.handleSignerClose()

      if (err) {
        const errorIntent = this.makeTransactionIntent(transaction)
        this.showWeb3ActionSigner(errorIntent, { error: err })
        reject(err)
        console.error(err)
        return
      }

      accept(res)
    })
  }
  handleSignerClose = () => {
    this.setState({ signerOpened: false })
  }
  handleSignerTransitionEnd = opened => {
    // Reset signer state only after it has finished transitioning out
    if (!opened) {
      this.setState({
        web3Action: {},
      })
    }
  }
  isAppInstalled(instanceId) {
    const { apps } = this.props
    return (
      staticApps.has(instanceId) &&
      !!apps.find(app => addressesEqual(app.proxyAddress, instanceId))
    )
  }
  showWeb3ActionSigner = (intent, { direct, error, paths }) => {
    this.setState({
      signerOpened: true,
      web3Action: {
        error,
        intent,
        paths,
        direct,
      },
    })
  }
  render() {
    const { signerOpened, web3Action } = this.state
    const {
      account,
      apps,
      walletWeb3,
      wrapper,
      appsLoading,
      locator: { instanceId, params },
    } = this.props
    return (
      <React.Fragment>
        <Main>
          <MenuPanel
            apps={apps.filter(app => app.hasWebApp)}
            appsLoading={appsLoading}
            activeInstanceId={instanceId}
            notificationsObservable={wrapper && wrapper.notifications}
            onOpenApp={this.openApp}
            onClearAllNotifications={this.handleNotificationsClearAll}
            onOpenNotification={this.handleNotificationNavigation}
          />
          <AppScreen>{this.renderApp(instanceId, params)}</AppScreen>
        </Main>
        <SidePanel
          onClose={this.handleSignerClose}
          onTransitionEnd={this.handleSignerTransitionEnd}
          opened={signerOpened}
          title="Sign Transaction"
        >
          <SignerPanelContent
            account={account}
            onClose={this.handleSignerClose}
            onSign={this.handleSigningWeb3Tx}
            web3={walletWeb3}
            {...web3Action}
          />
        </SidePanel>
      </React.Fragment>
    )
  }
  renderApp(instanceId, params) {
    const {
      apps,
      appsLoading,
      permissions,
      permissionsLoading,
      account,
      walletNetwork,
      wrapper,
      connected,
      daoName,
      daoAddress,
      resolveEntity,
      resolveRole,
    } = this.props

    if (instanceId === 'home') {
      return (
        <Home
          connected={connected}
          appsLoading={appsLoading}
          onOpenApp={this.openApp}
          apps={apps}
          daoName={daoName}
        />
      )
    }

    if (instanceId === 'permissions') {
      return (
        <Permissions
          apps={apps}
          appsLoading={appsLoading}
          permissions={permissions}
          permissionsLoading={permissionsLoading}
          daoAddress={daoAddress}
          params={params}
          onParamsRequest={this.handleParamsRequest}
          resolveEntity={resolveEntity}
          resolveRole={resolveRole}
        />
      )
    }

    if (instanceId === 'apps') {
      return (
        <ComingSoon
          title="Apps"
          subtitle={`
            The apps manager is not quite ready for prime time but will be
            available soon.
          `}
        />
      )
    }

    if (instanceId === 'settings') {
      return (
        <Settings
          daoAddr={daoAddress}
          account={account}
          walletNetwork={walletNetwork}
          apps={apps}
        />
      )
    }

    if (!wrapper || appsLoading) {
      return <LoadingApps />
    }

    const app = apps.find(app => addressesEqual(app.proxyAddress, instanceId))

    return app ? (
      <AppIFrame
        app={app}
        ref={this.handleAppIFrameRef}
        onLoad={this.handleAppIFrameLoad}
      />
    ) : (
      <App404 onNavigateBack={this.props.historyBack} />
    )
  }
}

const Main = styled.div`
  display: flex;
  align-items: stretch;
  height: 100vh;
`

const AppScreen = styled.div`
  position: relative;
  z-index: 1;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  overflow: auto;
`

const LoadingApps = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    }}
  >
    Loading apps…
  </div>
)

export default Wrapper
