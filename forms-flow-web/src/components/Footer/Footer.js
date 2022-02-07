import React from "react";
import "./footer.scss";
import { version } from "../../../package.json";
import Footer from "@button-inc/bcgov-theme/Footer";

const BCGovFooter = React.memo(() => {
  const footerItems = [
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
    {
      href: "https://www2.gov.bc.ca/gov/content?id=6A77C17D0CCB48F897F8598CCC019111",
      label: "Contact Us",
    },
  ];

  return (
    <Footer>
      <ul>
        {footerItems.map((item) => (
          <li>
            <a href={item.href} target='_blank'>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </Footer>
  );
});
export default BCGovFooter;
