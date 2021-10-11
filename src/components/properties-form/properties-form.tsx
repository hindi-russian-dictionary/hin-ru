import React from 'react';

import {
  PartOfSpeech,
  PARTS_OF_SPEECH_PROPERTIES,
} from 'utils/parts-of-speech';
import {Article} from 'lib/db';

type Props = {
  partOfSpeech: PartOfSpeech;
  properties: Article['properties'];
  setProperties: React.Dispatch<React.SetStateAction<Article['properties']>>;
};

export const PropertiesForm: React.FC<Props> = (props) => {
  const updateProperty = React.useCallback((propertyKey, valueKey, value) => {
    props.setProperties((prevProperties) => ({
      ...prevProperties,
      [propertyKey]: {
        ...prevProperties[propertyKey],
        [valueKey]: value,
      },
    }));
  }, []);
  return (
    <>
      <label htmlFor="properties">Свойства</label>
      {(PARTS_OF_SPEECH_PROPERTIES[props.partOfSpeech] || []).map((prop) => (
        <div className="form-group" key={'prop-' + prop.key}>
          <label htmlFor={prop.key}>{prop.name}</label>
          <br />
          <div className="form-check form-check-inline">
            {prop.values.map((value) => {
              const valueId = 'prop-' + prop.key + '-value-' + value.key;
              return (
                <React.Fragment key={value.key}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={valueId}
                    value={value.key}
                    onChange={(event) =>
                      updateProperty(prop.key, value.key, event.target.checked)
                    }
                    checked={Boolean(props.properties[prop.key]?.[value.key])}
                  />
                  <label className="form-check-label pr-2" htmlFor={valueId}>
                    {value.name}
                  </label>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
};
