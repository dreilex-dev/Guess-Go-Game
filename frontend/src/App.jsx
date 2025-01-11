import Details from "./componenets/details/Details"
import List from "./componenets/list/List"
import Chat from "./componenets/chat/Chat"
import Login from "./componenets/login/Login"
import Notification from "./componenets/notification/Notification"

const App = () => {

  const user =false
  return (
    <div className="container">
      { user?
        (<>
            <List/>
            <Chat/>
            <Details/>
          </>
        )
        :(<Login/>)}
        <Notification/>
      
    </div>
  )
}

export default App