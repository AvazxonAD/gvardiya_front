import { Provider } from "react-redux";
import { store } from "./Redux/store";
import MainProvider from "./mainProvider";
import { Utilsprovider } from "./providers/utilsprovider";
import { initTokenManager } from "./services/tokenManager";
import { ThemeSync } from "./ui";

initTokenManager();

function App() {
  return (
    <Provider store={store}>
      {/* Mavzuni <html> ga yozadi — login sahifasi ham qamrab olinadi */}
      <ThemeSync />
      <Utilsprovider>
        <MainProvider />
      </Utilsprovider>
    </Provider>
  );
}

export default App;
