import { Redirect, Route, Switch } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/inventory" component={InventoryPage} />
        <Route path="/products/:sku" component={ProductPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Redirect to="/inventory" />
      </Switch>
    </Layout>
  );
}
