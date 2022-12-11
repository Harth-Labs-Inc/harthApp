export const IconDice = ({ fill = '#2F1D2A', hasGradient }) => (
  <svg
    height="100%" 
    width="100%" 
    viewBox={'0 0 7277 7548'}
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision',
      imageRendering: 'optimizeQuality',
    }}
    fillRule="evenodd"
    clipRule="evenodd"
  >
    <defs>
        <linearGradient id="gradient">
          <stop offset="30%" stop-color="#BB7EC4" />
          <stop offset="90%" stop-color="#0DA1B5" />
        </linearGradient>
    </defs>

    <path
        fill={hasGradient ? "url(#gradient)" : {fill}}
        d="m3796 3274 3481-1717v4239L3796 7513V3274zm851 230c-265 171-453 646-274 923 105 163 291 163 449 61 264-170 453-645 274-922-105-163-292-164-449-62zm802 539c-231 149-381 489-334 761 48 280 282 370 509 223 231-149 381-489 334-761-48-280-283-370-509-223zm802 539c-231 149-381 490-334 760 48 282 282 371 509 224 231-149 380-490 334-761-45-265-270-378-509-223z"
    />
    <path
      className="fil1"
      fill={hasGradient ? "url(#gradient)" : {fill}}
      d="M3626 0 106 1402l3520 1736 3520-1736L3626 0zm0 951c685 0 1240 276 1240 618 0 341-555 618-1240 618s-1240-277-1240-618c0-342 555-618 1240-618zM3514 7548V3270L0 1537v4278l3514 1733zM650 4499c225-99 528 97 678 438 149 341 88 697-137 795-224 99-528-97-677-438-150-340-89-696 136-795zm1661-1060c225-99 528 97 678 438 149 341 88 697-137 795-224 99-528-97-677-438-150-340-89-696 136-795z"
    />
  </svg>
)
