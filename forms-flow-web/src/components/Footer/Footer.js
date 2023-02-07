import React from "react";
import "./footer.scss";
import Footer from "@button-inc/bcgov-theme/Footer";

const BCGovFooter = React.memo(() => {
  const footerItems = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "https://www2.gov.bc.ca/gov/content?id=79F93E018712422FBC8E674A67A70535",
      label: "Disclaimer",
    },
    {
      href: "https://www2.gov.bc.ca/gov/content?id=9E890E16955E4FF4BF3B0E07B4722932",
      label: "Privacy",
    },
    {
      href: "https://www2.gov.bc.ca/gov/content?id=E08E79740F9C41B9B0C484685CC5E412",
      label: "Accessibility",
    },
    {
      href: "https://www2.gov.bc.ca/gov/content?id=1AAACC9C65754E4D89A118B875E0FBDA",
      label: "Copyright",
    },
  ];

  return (
    <Footer>
      <ul>
        {footerItems.map((item) => (
          <li key={item.label}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
        <li key="Contact Us">
          <a 
          href="mailto:digitaljourneys@gov.bc.ca" 
          target="_blank"
          rel="noreferrer">Contact Us</a>
        </li>
      </ul>
    </Footer>
  );
});
export default BCGovFooter;
