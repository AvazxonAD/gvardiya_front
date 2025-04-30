import { Provider } from "react-redux";
import { store } from "./Redux/store";
import MainProvider from "./mainProvider";
import { Utilsprovider } from "./providers/utilsprovider";

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
