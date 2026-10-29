import NotificationSubscriptions from "./components/NotificationSubscriptions";
import OrdersContainer from "./components/OrdersContainer";

function App() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <OrdersContainer />
      <NotificationSubscriptions />
    </div>
  );
}

export default App;
