import styles from './nav.module.css'
import {Heading, Button} from 'evergreen-ui'

export const Nav = () => {
  return (
    <div className={styles.navWrapper}>
      <div className={styles.navContainer}>
        <div className={styles.titleContainer}>
          <Heading size={700} fontWeight={700} >KeyBox</Heading>
        </div>
        <div className={styles.btnContainer}>
          <Button marginRight={10}>Log in</Button>
          <Button appearance="primary">Sign up</Button>
        </div>
      </div>
    </div>
  )
}