import { useState, useEffect } from 'react'

import styles from '../../../styles/pages/Events.module.scss'

const Events = (props) => {
  return (
    <section className={styles.Events}>
      <div className={styles.create}>
        <p>Create an Event</p>
        <button className={styles.button}></button>
      </div>
    </section>
  )
}

export default Events
