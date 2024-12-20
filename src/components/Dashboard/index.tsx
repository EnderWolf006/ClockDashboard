import './style.css';
import React, { useLayoutEffect, useMemo } from 'react';
import { dashboard, bitable, DashboardState, IConfig } from "@lark-base-open/js-sdk";
import { Button, DatePicker, ConfigProvider, Checkbox, Row, Col, Input, Switch, Select } from '@douyinfe/semi-ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useConfig } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next/typescript/t';
import DashboardConfig from '../DashboardConfig';
import { DashboardView } from '../DashboardView';

export default function Dashboard() {

  const { t, i18n } = useTranslation();

  // create时的默认配置
  const [config, setConfig] = useState({
    common: {
      precision: true,
      timezone: 8,
      clockType: 'traditional'
    },
    traditionalClock: {
      secAnimationSmooth: true,
      skin: 'dial_1',
    },
    digitalClock: {
      mode: 24,
      font: 'jetB',
    },
    scale: 1.0
  })

  const isCreate = dashboard.state === DashboardState.Create

  useEffect(() => {
    if (isCreate) {
      setConfig({
        common: {
          precision: true,
          timezone: 8,
          clockType: 'traditional'
        },
        traditionalClock: {
          secAnimationSmooth: true,
          skin: 'dial_1',
        },
        digitalClock: {
          mode: 24,
          font: 'jetB',
        },
        scale: 1.0
      })
    }
  }, [i18n.language, isCreate])

  /** 是否配置/创建模式下 */
  const isConfig = dashboard.state === DashboardState.Config || isCreate;

  const timer = useRef<any>()

  /** 配置用户配置 */
  const updateConfig = (res: IConfig) => {

    if (timer.current) {
      clearTimeout(timer.current)
    }
    const { customConfig } = res;
    if (customConfig) {
      setConfig(customConfig as any);
      timer.current = setTimeout(() => {
        //自动化发送截图。 预留3s给浏览器进行渲染，3s后告知服务端可以进行截图了（对域名进行了拦截，此功能仅上架部署后可用）。
        dashboard.setRendered();
      }, 3000);

    }

  }

  useConfig(updateConfig)

  return (
    <main style={isConfig ? {backgroundColor: "var(--cbgc)"} : { borderTop: 'none' ,backgroundColor: "var(--cbgc)"}}>
      <div className='layout-view' >
        <_DashboardView
          t={t}
          config={config}
          isConfig={isConfig}
        />
      </div>
      {
        isConfig && (
          <div className='layout-cfg'>
            <ConfigPanel t={t} config={config} setConfig={setConfig}/>
          </div>
        )
      }
    </main>
  )
}


interface IDashboardView {
  config: any,
  isConfig: boolean,
  t: TFunction<"translation", undefined>,
}
function _DashboardView({ config, isConfig, t }: IDashboardView) {
  return (
    <>
      <div className="view">
        <DashboardView config={config} isConfig={isConfig} t={t}></DashboardView>
      </div>
    </>
  );
}

function ConfigPanel(props: {
  config: any,
  setConfig: any,
  t: TFunction<"translation", undefined>,
}) {
  const { config, setConfig, t } = props;
  const configRef = useRef(null) as any;
  /**保存配置 */
  const onSaveConfig = () => {
    const cfg = configRef.current.handleSetConfig()

    if (!cfg) return
    dashboard.saveConfig({
      customConfig: cfg,
      dataConditions: [],
    } as any)
  }

  return (
    <>
      <div className="layout-cfg-main">
        <DashboardConfig config={config} setConfig={setConfig} t={t} ref={configRef}></DashboardConfig>
      </div>
      <div className="layout-cfg-btn">
        <Button type='primary' theme='solid' size='large' className='confirmButton' onClick={onSaveConfig}>{t('button.confirm')}</Button>
      </div>
    </>
  )
}