import Head from "next/head";

const Layout = ({ children }) => {
    return (
        <>
            <Head>
                <title>Härth</title>
                <meta property="og:title" content="Härth" key="title" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <link rel="manifest" href="/manifest.json" />

                <link rel="icon" type="image/x-icon" href="favicon.ico" />
                <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="512x512" href="/icons/apple-touch-icon-512x512.png" purpose="maskable" />
                <link rel="apple-touch-icon" sizes="1024x1024" href="/icons/apple-touch-icon-1024x1024.png" purpose="maskable"/>
                <link rel="icon" type="image/png" sizes="16x16" href="favicon.ico" />
                <link rel="icon" type="image/png" sizes="36x36" href="/icons/icon-36x36.png" density="0.75" />
                <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png" density="1.0" />
                <link rel="icon" type="image/png" sizes="70x70" href="/icons/icon-70x70.png" />
                <link rel="icon" type="image/png" sizes="72x72" href="/icons/icon-72x72.png" density="1.5" />
                <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" density="2.0" />
                <link rel="icon" type="image/png" sizes="128x128" href="/icons/icon-128x128.png" />
                <link rel="icon" type="image/png" sizes="144x144" href="/icons/icon-144x144.png" density="3.0" />
                <link rel="icon" type="image/png" sizes="150x150" href="/icons/icon-150x150.png" />
                <link rel="icon" type="image/png" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" density="4.0" />
                <link rel="icon" type="image/png" sizes="310x310" href="/icons/icon-310x310.png" />
                <link rel="icon" type="image/png" sizes="384x384" href="/icons/icon-384x384.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
                <meta name="msapplication-TileColor" content="#f9f9f9" />


                <meta
                    name="msapplication-TileImage"
                    content="/icons/icon-144x144.png"
                />

                <meta name="theme-color" content="#f9f9f9" />

                <meta name="apple-mobile-web-app-title" content="Härth" />
                <meta name="apple-mobile-web-app-capable" content="yes" />

                


            </Head>
            {children}
        </>
    );
};

export default Layout;
