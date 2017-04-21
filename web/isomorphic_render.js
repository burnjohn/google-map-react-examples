// client-server module

import React from 'react';
import render from './flux/render.js';
import {serialize, deserialize} from 'utils/serialize.js';
import ReactDOMServer from 'react-dom/server';
import ReactDOM from 'react-dom';

// i place both realization of render in one file
// in oreder to show that there are alomost no difference
// between server and client rendering
export default function isomorphicRender({isClient, serverPath}) {
  if (isClient) {
    if (__DEV__) {
      window.React = React; // for devtools
    }
    // React.initializeTouchEvents(true); // i don't remeber do i need this :-)

    const initialState = window.K_SERIALIZED_DATA && deserialize(window.K_SERIALIZED_DATA) || undefined;

    client: serverPath = undefined;
    return render({React, initialState /*, serverPath*/})
      .then(
        ({component /* client: no need in filled initialState */}) =>
            ReactDOM.render(component, document.getElementById('react_main')), // ServDiff
        (err) => {
          console.error('app.js error', err); // eslint-disable-line no-console
          throw err;
        }
      );
  }

  // -------------------------------------------------------------------------
  // ------------------------===<<< SERVER RENDERING >>>===---------------
  // -------------------------------------------------------------------------

  return render({React, serverPath /* server: no initialState on the server, server must prepare it for client*/})
    .then(
      ({component, initialState}) => ({
        html: ReactDOMServer.renderToString(component), // server: render to string not Dom
        initialState: serialize(initialState)  // server: initialState at this moment is filled with data, so with html we also return initialState
                                               //         find this code `multiActionMiddleware({wait: isServerCall})` to see
      }),
      (err) => {
        console.error('app.js error', err); // eslint-disable-line no-console
        throw err;
      }
    );
}
