import DeletedOrdersReport from "./components/DeletedOrdersReport";
import NotificationSubscriptions from "./components/NotificationSubscriptions";
import OrdersContainer from "./components/OrdersContainer";

function App() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <p className="text-xs font-bold tracking-wide text-orange-300 uppercase">
          Event-driven architecture
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-500 md:text-3xl">
          Keep every order moving.
        </h1>
      </header>

      <OrdersContainer />
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <DeletedOrdersReport />
        <NotificationSubscriptions />
      </div>
    </div>
  );
}

export default App;
