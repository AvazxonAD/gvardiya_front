import { Provider } from "react-redux";
import { store } from "./Redux/store";
import MainProvider from "./mainProvider";
import { Utilsprovider } from "./providers/utilsprovider";
import { initTokenManager } from "./services/tokenManager";

initTokenManager();

function App() {
  return (
    <Provider store={store}>
      <Utilsprovider>
        <MainProvider />
      </Utilsprovider>
    </Provider>
  );
}

export default App;
