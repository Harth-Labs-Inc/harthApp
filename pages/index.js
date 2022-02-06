import Head from 'next/head'

import { useAuth } from '../contexts/auth'
import Auth from '../pages/auth/index'
import Dashboard from './dashboard/index'


const IndexPage = () => {
  const { user, loading } = useAuth()

  const AuthOrDashboard = () => {
    if (loading) return null
    if (user) return <Dashboard></Dashboard>
    if (!user) return <Auth></Auth>
  }

  return (
    <>
      <Head>
        <title>Harth</title>
      </Head>
      <AuthOrDashboard></AuthOrDashboard>
    </>
  )
}

export default IndexPage
