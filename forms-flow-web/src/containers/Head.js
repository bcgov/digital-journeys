import React from "react";
import { Translation } from "react-i18next";

const Head = React.memo((props) => {
  const { items, page } = props;

  if (['Applications', 'Drafts'].includes(page)) {
    const item = items[0];
    return (
      <div className="header-container">
        <div className="main-header">
          <div className="head-item" style={{ color: "black" }}>
            <h3 className="application-head application-head-active" style={{marginBlockEnd: "5px"}}>
              <i
                className={`fa fa-${item?.icon}`}
                style={{ marginTop: "5px" }}
                aria-hidden="true"
              />
              <span className="application-text">
                <Translation>{(t) => t(item?.title)}</Translation>
              </span>
              {item?.count ?
                <div className="application-count" role="contentinfo">
                  ({item?.count})
                </div> : null}
            </h3>
            <span>{item?.description}</span>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="header-container">
        <div className="main-header">
          {items?.map((item, key) => (
            <div
              key={key}
              className={`head-item ${item.name === page ? "head-active" : ""} ${key > 0 ? 'padding-left-60' : '' }`}
            >
              <h3 onClick={item?.onClick} className="application-head">
                <i
                  className={`fa fa-${item?.icon}`}
                  style={{ marginTop: "5px" }}
                  aria-hidden="true"
                />
                <span className="application-text">
                  <Translation>{(t) => t(item?.name)}</Translation>
                </span>
                { item?.count ? 
                  <div className="application-count" role="contentinfo">
                  ({item?.count})
                </div> : null}
              </h3>
            </div>
          ))}
        </div>
        <hr className="head-rule" />
      </div>
    );
  }
});

export default Head;
