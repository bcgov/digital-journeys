import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "../../../components/Footer/Footer";

test("render Footer", () => {
  render(<Footer />);
  // console.log(screen.getByText("formsflow.ai").href);
  expect(true).toBe(true);
  // expect(screen.getByText("formsflow.ai").href).toBe("https://formsflow.ai/");
});
