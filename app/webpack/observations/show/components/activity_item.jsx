import React, { PropTypes } from "react";
import ReactDOMServer from "react-dom/server";
import { Panel } from "react-bootstrap";
import moment from "moment-timezone";
import SplitTaxon from "../../../shared/components/split_taxon";
import UserText from "../../../shared/components/user_text";
import UserImage from "../../identify/components/user_image";
import ActivityItemMenu from "./activity_item_menu";
import util from "../util";

const ActivityItem = ( { observation, item, config, deleteComment, deleteID, firstDisplay,
                         restoreID, setFlaggingModalState, currentUserID, addID } ) => {
  if ( !item ) { return ( <div /> ); }
  const taxon = item.taxon;
  const isID = !!taxon;
  const loggedIn = config && config.currentUser;
  let contents;
  let header;
  let className;
  const userLink = (
    <a className="user" href={ `/people/${item.user.login}` }>{ item.user.login }</a>
  );
  if ( isID ) {
    let buttons = [];
    let canAgree = false;
    let userAgreedToThis;
    if ( item.current && firstDisplay && item.user.id !== config.currentUser.id ) {
      if ( currentUserID ) {
        canAgree = util.taxaDissimilar( currentUserID.taxon, taxon );
        userAgreedToThis = currentUserID.agreedTo && currentUserID.agreedTo.id === item.id;
      } else {
        canAgree = true;
      }
    }
    if ( loggedIn && ( canAgree || userAgreedToThis ) ) {
      buttons.push( (
        <button
          key={ `id-agree-${item.id}` }
          className="btn btn-default btn-sm"
          onClick={ () => { addID( taxon, { agreedTo: item } ); } }
          disabled={ userAgreedToThis }
        >
          { userAgreedToThis ? ( <div className="loading_spinner" /> ) :
            ( <i className="fa fa-check" /> ) } { I18n.t( "agree_" ) }
        </button>
      ) );
    }
    if ( firstDisplay ) {
      buttons.push( (
        <a
          key={ `id-compare-${item.id}` }
          href={ `/observations/identotron?observation_id=${observation.id}&taxon_id=${taxon.id}` }
        >
          <button className="btn btn-default btn-sm">
            <i className="fa fa-exchange" /> { I18n.t( "compare" ) }
          </button>
        </a>
      ) );
    }
    const buttonDiv = ( <div className="buttons">
      <div className="btn-space">
        { buttons }
      </div>
    </div> );
    const taxonImageTag = util.taxonImage( taxon );
    header = I18n.t( "user_suggested_an_id", { user: ReactDOMServer.renderToString( userLink ) } );
    if ( !item.current ) { className = "withdrawn"; }
    contents = (
      <div className="identification">
        <div className="taxon">
          { taxonImageTag }
          <SplitTaxon
            taxon={ taxon }
            url={ `/taxa/${taxon.id}` }
          />
        </div>
        { buttonDiv }
        { item.body && ( <UserText text={ item.body } className="id_body" /> ) }
      </div>
    );
  } else {
    header = I18n.t( "user_commented", { user: ReactDOMServer.renderToString( userLink ) } );
    contents = ( <UserText text={ item.body } /> );
  }
  const relativeTime = moment.parseZone( item.created_at ).fromNow( );
  let panelClass;
  let status;
  if ( item.flags && item.flags.length > 0 ) {
    panelClass = "flagged";
    status = ( <span className="item-status">
      <i className="fa fa-flag" /> { I18n.t( "flagged_" ) }
    </span> );
  } else if ( item.category && item.current ) {
    if ( item.category === "maverick" ) {
      panelClass = "maverick";
      status = ( <span className="item-status">
        <i className="fa fa-bolt" /> { I18n.t( "maverick" ) }
      </span> );
    } else if ( item.category === "improving" ) {
      panelClass = "improving";
      status = ( <span className="item-status">
        <i className="fa fa-trophy" /> { I18n.t( "improving" ) }
      </span> );
    }
  }
  return (
    <div className={ className }>
      <div className="icon">
        <UserImage user={ item.user } />
      </div>
      <Panel className={ panelClass } header={(
        <span>
          <span className="title_text" dangerouslySetInnerHTML={ { __html: header } } />
          <ActivityItemMenu
            item={ item }
            config={ config }
            deleteComment={ deleteComment }
            deleteID={ deleteID }
            restoreID={ restoreID }
            setFlaggingModalState={ setFlaggingModalState }
          />
          <span className="time">
            { relativeTime }
          </span>
          { status }
        </span>
        )}
      >
        { contents }
      </Panel>
    </div>
  );
};

ActivityItem.propTypes = {
  item: PropTypes.object,
  config: PropTypes.object,
  currentUserID: PropTypes.object,
  observation: PropTypes.object,
  addID: PropTypes.func,
  deleteComment: PropTypes.func,
  deleteID: PropTypes.func,
  restoreID: PropTypes.func,
  firstDisplay: PropTypes.bool,
  setFlaggingModalState: PropTypes.func
};

export default ActivityItem;
