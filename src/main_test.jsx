import React from 'react'
import { createRoot } from 'react-dom/client'

console.log("MINIMAL_BOOT: Started");

const Test = () => <h1>SYSTEM ALIVE</h1>;

const container = document.getElementById('root');
if (container) {
    console.log("MINIMAL_BOOT: Container found");
    const root = createRoot(container);
    root.render(<Test />);
    console.log("MINIMAL_BOOT: Render called");
} else {
    console.error("MINIMAL_BOOT: Root container not found");
}
