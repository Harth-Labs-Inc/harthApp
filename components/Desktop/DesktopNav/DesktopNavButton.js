import { useState, } from 'react'
import { ChatFill } from '../../../resources/icons/ChatFill'
import { ChatNoFill  } from '../../../resources/icons/ChatNoFill'
import { FireFill } from '../../../resources/icons/FireFill'
import { FireNoFill  } from '../../../resources/icons/FireNoFill'
import { ForumFill } from '../../../resources/icons/ForumFill'
import { ForumNoFill  } from '../../../resources/icons/ForumNoFill'

import styles from './desktopNav.module.scss'



export const DesktopNavButton = (props) => {
    const {label, isActive, command} = props
    const [isHover, setHover] = useState(false)
    const IconActive = FireFill
    const IconInactive = FireNoFill

   
    if (label==='Chat'){
        IconInactive = ChatNoFill
        IconActive = ChatFill
    }
    if (label==='Gather'){
        IconInactive = FireNoFill
        IconActive = FireFill
    }
    if (label==='Message'){
        IconInactive = ForumNoFill
        IconActive = ForumFill
    }
    

    return (
      <>
      <button className={styles.navButton} onMouseEnter={() => {setHover(true)}} onMouseLeave={() => {setHover(false)}} onClick={command}>
        <div style={{display: "flex", flexDirection: "row", alignItems:"center", }}>
            {isActive
              ? <div style={{height: 24, width: 24, marginRight: 6,}}><IconActive color="#2f1d2a"/></div> //color is $fuel
              : <div style={{height: 24, width: 24, marginRight: 6,}}><IconInactive color="#2f1d2a" /></div> //color is $fuel
            }
           {isActive
            ? <div style={{fontWeight: 600,}}>{label}</div>
            : <div>{label}</div>
        } 
        </div>
        {isActive || isHover
            ? <div className={styles.indicator}></div>
            : <div style={{height: 5, backgroundColor: 'transparent',}}></div>
        }
      </button>

      </>
    )

  }
  
