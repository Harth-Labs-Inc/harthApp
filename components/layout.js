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
                <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-touch-icon-60x60.png" />
                <link rel="apple-touch-icon" sizes="64x64" href="/icons/apple-touch-icon-64x64.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
                <link rel="apple-touch-icon" sizes="128x128" href="/icons/apple-touch-icon-128x128.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png"  />
                <link rel="apple-touch-icon" sizes="256x256" href="/icons/apple-touch-icon-256x256.png" />
                <link rel="apple-touch-icon" sizes="512x512" href="/icons/apple-touch-icon-512x512.png"  />
                <link rel="apple-touch-icon" sizes="1024x1024" href="/icons/apple-touch-icon-1024x1024.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="favicon.ico" />
                <link rel="icon" type="image/png" sizes="36x36" href="/icons/icon-36x36.png" />
                <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png" />
                <link rel="icon" type="image/png" sizes="70x70" href="/icons/icon-70x70.png" />
                <link rel="icon" type="image/png" sizes="72x72" href="/icons/icon-72x72.png" />
                <link rel="icon" type="image/png" sizes="96x96" href="/icons/icon-96x96.png" />
                <link rel="icon" type="image/png" sizes="128x128" href="/icons/icon-128x128.png" />
                <link rel="icon" type="image/png" sizes="144x144" href="/icons/icon-144x144.png"  />
                <link rel="icon" type="image/png" sizes="150x150" href="/icons/icon-150x150.png" />
                <link rel="icon" type="image/png" sizes="152x152" href="/icons/icon-152x152.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="256x256" href="/icons/icon-256x256.png" />
                <link rel="icon" type="image/png" sizes="310x310" href="/icons/icon-310x310.png" />
                <link rel="icon" type="image/png" sizes="384x384" href="/icons/icon-384x384.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />


                <meta name="theme-color" content="#f5f5f8" />

                <meta name="apple-mobile-web-app-title" content="Härth" />
                <meta name="apple-mobile-web-app-capable" content="yes" />

                
                {/* <!-- iPhone Xs Max (1242px x 2688px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/apple-launch-1242x2688.png"> 
                <!-- iPhone Xr (828px x 1792px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/apple-launch-828x1792.png"> 
                <!-- iPhone X, Xs (1125px x 2436px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/apple-launch-1125x2436.png"> 
                <!-- iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus (1242px x 2208px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/apple-launch-1242x2208.png"> 
                <!-- iPhone 8, 7, 6s, 6 (750px x 1334px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/apple-launch-750x1334.png">  
                <!-- iPad Pro 12.9" (2048px x 2732px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/apple-launch-2048x2732.png"> 
                <!-- iPad Pro 11” (1668px x 2388px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/apple-launch-1668x2388.png"> 
                <!-- iPad Pro 10.5" (1668px x 2224px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="/apple-launch-1668x2224.png"> 
                <!-- iPad Mini, Air (1536px x 2048px) --> 
                <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/apple-launch-1536x2048.png"> */}

            </Head>
            {children}
        </>
    );
};

export default Layout;
