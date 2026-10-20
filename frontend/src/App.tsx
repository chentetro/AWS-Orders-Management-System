import Button from "./components/Button";
import Input from "./components/Input";

function App() {
  return (
    <div className="p-6">
      <Button>Click me</Button>
      <Input id="name" label="Name" />
    </div>
  );
}

export default App;
