import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import "./style.css";
import { DashboardState, FieldType, ThemeModeType, base, bitable, dashboard } from '@lark-base-open/js-sdk';
import { Button, Checkbox, Input, Select, Toast } from "@douyinfe/semi-ui";
import timezoneZH from '../../timezone/timezone_zh.json';
import timezoneEN from '../../timezone/timezone_en.json';
import timezoneJA from '../../timezone/timezone_ja.json';
import dialConfig from "../DashboardView/dialConfig.json";



let isDark = false
dashboard.getTheme().then((res) => {
  isDark = res.theme == ThemeModeType.DARK
})

function IconSelect({ optionList, onChange, value }: any) {
  return <>
    <div className="iconSelectContainer">
      {
        optionList.map((item: any) => {
          const prefix = isDark ? './dark_' : './'
          if (item.value === value)
            return (
              <div className="iconSelectItem selected" onClick={(e) => onChange(item.value)}>
                <img className="iconSelectIcon" src={prefix + item.selectedIcon}></img>
                {item.label && <div className="iconSelectLabel">{item.label}</div>}
              </div>
            )
          return (
            <div className="iconSelectItem" onClick={(e) => onChange(item.value)}>
              <img className="iconSelectIcon" src={prefix + item.icon}></img>
              {item.label && <div className="iconSelectLabel">{item.label}</div>}
            </div>
          )
        })
      }
    </div>
  </>
}

function DashboardConfig(props: any, ref: any) {
  const isCreate = dashboard.state === DashboardState.Create
  const { config, setConfig, t, onConfigChange } = props;

  let [timezoneOptionList, setTimezoneOptionList] = useState(timezoneEN) as any

  bitable.bridge.getLanguage().then((lng) => {
    setTimezoneOptionList(lng === 'zh' ? timezoneZH : lng === 'ja' ? timezoneJA : timezoneEN)
  });

  const clockTypeOptionList = [
    {
      label: t('clockType.traditional'),
      value: 'traditional',
      icon: 'classic_default.svg',
      selectedIcon: 'classic_selected.svg',
    },
    {
      label: t('clockType.digital'),
      value: 'digital',
      icon: 'electronic_default.svg',
      selectedIcon: 'electronic_selected.svg',
    }
  ]

  const digitalClockModeOptionList = [
    {
      label: t('digitalClock.mode.12'),
      value: 12
    },
    {
      label: t('digitalClock.mode.24'),
      value: 24
    }
  ]

  const digitalClockFontOptionList = [
    {
      label: 'JetBrainsMono',
      value: 'jetB'
    },
    {
      label: 'FusionPixel',
      value: 'fPixel'
    }
  ]

  let traditionalClockSkinOptionList = Object.keys(dialConfig).map((item: any) => {
    return {
      value: item,
      icon: `./dialResourse/${item}/style_default.svg`,
      selectedIcon: `./dialResourse/${item}/style_selected.svg`,
    }
  })

  useImperativeHandle(ref, () => ({
    handleSetConfig() {
      // 当确认按钮点击时被Dashboard调用
      return config
    }
  }));

  return (
    <>
      <div className="prompt">{t('timezone')}</div>
      <Select placeholder={t('placeholder.pleaseSelect')} className="select" optionList={timezoneOptionList} onChange={(e) => { setConfig({ ...config, common: { ...config.common, timezone: e } }) }} value={config.common.timezone}></Select>

      <div className="prompt">{t('clockType')}</div>
      <IconSelect optionList={clockTypeOptionList} onChange={(e: any) => { setConfig({ ...config, common: { ...config.common, clockType: e } }) }} value={config.common.clockType} />
      <br/>
      <Checkbox className="select" onChange={(e) => { setConfig({ ...config, common: { ...config.common, precision: e.target.checked } }) }} checked={config.common.precision}>{config.common.clockType !== 'traditional' ? t('precision') : t('precision_d')}</Checkbox >

      {
        config.common.clockType === 'traditional'
          ?
          <>
            {config.common.precision && <Checkbox className="select" onChange={(e) => { setConfig({ ...config, traditionalClock: { ...config.traditionalClock, secAnimationSmooth: e.target.checked } }) }} checked={config.traditionalClock.secAnimationSmooth}>{t('traditionalClock.secHandSmooth')}</Checkbox >}

            <div className="prompt">{t('traditionalClock.skin')}</div>

            <div className="clockSelectContainer">
              <IconSelect optionList={traditionalClockSkinOptionList} onChange={(e: any) => { setConfig({ ...config, traditionalClock: { ...config.traditionalClock, skin: e } }) }} value={config.traditionalClock.skin}></IconSelect>
            </div>
          </>
          :
          <>
            <div className="prompt">{t('digitalClock.mode')}</div>
            <Select placeholder={t('placeholder.pleaseSelect')} className="select" optionList={digitalClockModeOptionList} onChange={(e) => { setConfig({ ...config, digitalClock: { ...config.digitalClock, mode: e } }) }} value={config.digitalClock.mode}></Select>

            <div className="prompt">{t('digitalClock.font')}</div>
            <Select placeholder={t('placeholder.pleaseSelect')} className="select" optionList={digitalClockFontOptionList} onChange={(e) => { setConfig({ ...config, digitalClock: { ...config.digitalClock, font: e } }) }} value={config.digitalClock.font}></Select>
          </>
      }
    </>
  )
}

export default React.forwardRef(DashboardConfig)