import { createApp } from 'vue'
import App from './app.vue'
import router from '../router/index.js'  // Fixed path

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faBook, 
  faRobot, 
  faMicrophone, 
  faSearch, 
  faHome,
  faPlay,
  faPause,
  faStop,
  faStepForward,
  faStepBackward,
  faVolumeUp,
  faVolumeMute,
  faBookmark,
  faCopy,
  faExpand,
  faCompress,
  faPhone,
  faPhoneSlash,
  faMicrophoneSlash,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faFilter,
  faHeart,
  faShareAlt,
  faDownload,
  faCog,
  faUser,
  faHeadphones,
  faMusic,
  faStar,
  faGlobe,
  faLanguage,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faQuoteLeft,
  faQuoteRight,
  faTimes,
  faTh,
  faList,
  faPlug,
  faBan
} from '@fortawesome/free-solid-svg-icons'

import {
  faHeart as faHeartRegular,
  faBookmark as faBookmarkRegular,
  faUser as faUserRegular,
  faStar as faStarRegular
} from '@fortawesome/free-regular-svg-icons'

// Add icons to library
library.add(
  faBook, 
  faRobot, 
  faMicrophone, 
  faSearch, 
  faHome,
  faPlay,
  faPause,
  faStop,
  faStepForward,
  faStepBackward,
  faVolumeUp,
  faVolumeMute,
  faBookmark,
  faCopy,
  faExpand,
  faCompress,
  faPhone,
  faPhoneSlash,
  faMicrophoneSlash,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faFilter,
  faHeart,
  faShareAlt,
  faDownload,
  faCog,
  faUser,
  faHeadphones,
  faMusic,
  faStar,
  faGlobe,
  faLanguage,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faQuoteLeft,
  faQuoteRight,
  faTimes,
  faTh,
  faList,
  faPlug,
  faBan,
  faHeartRegular,
  faBookmarkRegular,
  faUserRegular,
  faStarRegular
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)

app.mount('#app')