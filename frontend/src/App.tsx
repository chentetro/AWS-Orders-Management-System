import CreateNewOrder from "./components/CreateNewOrder";
import NotificationSubscriptions from "./components/NotificationSubscriptions";

function App() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <CreateNewOrder />
      <NotificationSubscriptions />
    </div>
  );
}

export default App;
