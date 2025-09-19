import { Auth0Provider } from '@auth0/auth0-react'
import type { LinksFunction, LoaderFunctionArgs, TypedResponse } from '@remix-run/node'
import {
  data,
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
} from '@remix-run/react'
import { useChangeLanguage } from 'remix-i18next/react'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'

// Import global CSS styles for the application
// The ?url query parameter tells the bundler to handle this as a URL import
import { ClientHintCheck } from '@/components/misc/ClientHints'
import { GenericErrorBoundary } from '@/components/misc/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { SITE_CONFIG } from '@/constants/brand'
import { getHints } from '@/hooks/useHints'
import { useNonce } from '@/hooks/useNonce'
import { getTheme, Theme, useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import i18nServer, { localeCookie } from '@/modules/i18n/i18n.server'
import SpinnerCSS from '@/styles/customs/spinner.css?url'
import RootCSS from '@/styles/root.css?url'
import { csrf } from '@/utils/csrf.server'
import { combineHeaders, getDomainUrl } from '@/utils/misc.server'
import { getToastSession } from '@/utils/toast.server'
import CoreUILayoutCSS from 'node_modules/core-ui/src/styles/layout.css?url'
import { ProgressBar } from './components/misc/ProgressBar'

export const handle = { i18n: ['translation'] }

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data ? `${SITE_CONFIG.siteTitle}` : `Error | ${SITE_CONFIG.siteTitle}`,
    },
    {
      name: 'description',
      content: SITE_CONFIG.siteDescription,
    },
  ]
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: RootCSS },
    { rel: 'stylesheet', href: SpinnerCSS },
    { rel: 'stylesheet', href: CoreUILayoutCSS },
  ]
}

export type LoaderData = Exclude<
  Awaited<ReturnType<typeof loader>>,
  Response | TypedResponse<unknown>
>

export async function loader({ request }: LoaderFunctionArgs) {
  const user = null

  const locale = await i18nServer.getLocale(request)
  const { toast, headers: toastHeaders } = await getToastSession(request)
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken()
  const clientID = process.env.AUTH0_CLIENT_ID
  const domain = process.env.AUTH0_DOMAIN
  const audience = process.env.AUTH0_AUDIENCE
  const organizationID = process.env.AUTH0_ORGANIZATION_ID
  const hostUrl = process.env.HOST_URL

  return data(
    {
      hostUrl,
      user,
      locale,
      toast,
      csrfToken,
      clientID,
      domain,
      audience,
      organizationID,
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: { theme: getTheme(request) },
      },
    } as const,
    {
      headers: combineHeaders(
        { 'Set-Cookie': await localeCookie.serialize(locale) },
        toastHeaders,
        csrfCookieHeader ? { 'Set-Cookie': csrfCookieHeader } : null,
      ),
    },
  )
}

function Document({
  children,
  nonce,
  lang = 'en',
  dir = 'ltr',
  theme = 'light',
}: {
  children: React.ReactNode
  nonce: string
  lang?: string
  dir?: 'ltr' | 'rtl'
  theme?: Theme
}) {
  return (
    <html
      lang={lang}
      dir={dir}
      className={`${theme} overflow-x-hidden`}
      style={{ colorScheme: theme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"></link>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <Links />
      </head>
      <body className="h-auto w-full">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster closeButton position="top-right" theme={theme} richColors />
      </body>
    </html>
  )
}

export default function AppWithProviders() {
  const {
    locale,
    toast,
    csrfToken,
    clientID,
    domain,
    audience,
    hostUrl,
    organizationID,
  } = useLoaderData<typeof loader>()

  const nonce = useNonce()
  const theme = useTheme()
  const navigate = useNavigate()

  // Updates the i18n instance language.
  useChangeLanguage(locale)

  // Renders toast (if any).
  useToast(toast)

  return (
    <Document nonce={nonce} theme={theme} lang={locale ?? 'en'}>
      <ProgressBar />
      <AuthenticityTokenProvider token={csrfToken}>
        <Auth0Provider
          domain={domain ?? ''}
          clientId={clientID ?? ''}
          onRedirectCallback={() => {
            navigate(hostUrl || 'http://localhost:3000')
          }}
          authorizationParams={{
            redirect_uri: hostUrl || 'http://localhost:3000',
            organization: organizationID,
            audience: audience,
          }}>
          <Outlet />
        </Auth0Provider>
      </AuthenticityTokenProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const nonce = useNonce()
  const theme = useTheme()

  return (
    <Document nonce={nonce} theme={theme}>
      <GenericErrorBoundary
        statusHandlers={{
          403: ({ error }) => (
            <p>You are not allowed to do that: {error?.data.message}</p>
          ),
        }}
      />
    </Document>
  )
}
