import React, { useEffect, useState } from "react";
import "./style.css";
import { bitable, dashboard } from '@lark-base-open/js-sdk';
import { Tooltip } from "@douyinfe/semi-ui";
import dialConfig from "./dialConfig.json";
let timer = undefined as any;

const dailResNameList = ['dial_1', 'dial_2', 'dial_3']

const dailRes = (() => {
  const res = {} as any;
  for (const name of dailResNameList) {
    res[name] = {
      light: {},
      dark: {}
    }
    res[name].light.dial = `./dialResourse/${name}/dial_light.svg`
    res[name].light.hour = `./dialResourse/${name}/hour_light.svg`
    res[name].light.min = `./dialResourse/${name}/min_light.svg`
    res[name].light.sec = `./dialResourse/${name}/sec_light.svg`
    res[name].dark.dial = `./dialResourse/${name}/dial_dark.svg`
    res[name].dark.hour = `./dialResourse/${name}/hour_dark.svg`
    res[name].dark.min = `./dialResourse/${name}/min_dark.svg`
    res[name].dark.sec = `./dialResourse/${name}/sec_dark.svg`
    res[name].config = dialConfig[name as 'dial_1']
  }
  return res;
})();

export function DashboardView(props: any) {
  const { config, isConfig, t } = props;

  const [theme, setTheme] = useState('light')
  bitable.bridge.getTheme().then((theme: string) => {
    setTheme(theme.toLocaleLowerCase())
  })

  const [time, setTime] = useState({
    hour: 0,
    min: 0,
    dsec: 0,
    sec: 0
  }) as any;

  useEffect(() => {
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      const _time = (() => {
        const now = new Date();
        return new Date(now.getTime() + (config.common.timezone - now.getTimezoneOffset() / -60) * 60 * 60 * 1000);
      })();
      const hour = _time.getHours();
      const min = _time.getMinutes();
      const sec = _time.getSeconds();
      if (sec == 0) {
        // 在平滑旋转时，秒针如果直接从60 - 0会出现逆时针动画，dsec 为 经典表盘专属属性
        setTime({ hour, min, dsec: -1, sec });
        requestAnimationFrame(() => {
          setTime({ hour, min, dsec: 0, sec });
        })
      } else
        setTime({ hour, min, dsec: sec, sec });

    }, 1000)
  }, [config.common.timezone])

  return (
    <>
      {
        config.common.clockType == 'traditional' ?
          <div className="space" style={{ '--bgc': dailRes[config.traditionalClock.skin].config.backgroudColor } as any}>
            <div className="t-clock">
              <img className="dial" src={dailRes[config.traditionalClock.skin][theme].dial} />
              {config.common.precision && <img className="hand" src={dailRes[config.traditionalClock.skin][theme].sec} style={{
                'zIndex': 4,
                '--rot': `${time.dsec / 60 * 360}deg`,
                "--originOffset": dailRes[config.traditionalClock.skin].config.hand.sec.originOffset,
                "--length": dailRes[config.traditionalClock.skin].config.hand.sec.length,
                "--width": dailRes[config.traditionalClock.skin].config.hand.sec.width,
                "transition": config.traditionalClock.secAnimationSmooth && time.dsec != -1 ? 'transform 1s linear' : 'none'
              } as any} />}
              <img className="hand" src={dailRes[config.traditionalClock.skin][theme].min} style={{
                'zIndex': 3,
                '--rot': `${(time.min + time.sec / 60) / 60 * 360}deg`,
                "--originOffset": dailRes[config.traditionalClock.skin].config.hand.min.originOffset,
                "--length": dailRes[config.traditionalClock.skin].config.hand.min.length,
                "--width": dailRes[config.traditionalClock.skin].config.hand.min.width
              } as any} />
              <img className="hand" src={dailRes[config.traditionalClock.skin][theme].hour} style={{
                'zIndex': 2,
                '--rot': `${((time.hour >= 12 ? time.hour - 12 : time.hour) + time.min / 60) / 12 * 360}deg`,
                "--originOffset": dailRes[config.traditionalClock.skin].config.hand.hour.originOffset,
                "--length": dailRes[config.traditionalClock.skin].config.hand.hour.length,
                "--width": dailRes[config.traditionalClock.skin].config.hand.hour.width
              } as any} />
            </div>
          </div> :
          <div className="space">
            <div className="d-clock" style={{ fontFamily: config.digitalClock.font, fontSize: isConfig ? '10vh' : '90vh' }}>
              <div className="number">{(config.digitalClock.mode == 24 ? time.hour : time.hour >= 12 ? time.hour - 12 : time.hour).toString().padStart(2, 0)}</div>
              <div className="number">:</div>
              <div className="number">{time.min.toString().padStart(2, 0)}</div>
              {config.common.precision && <>
                <div className="number">:</div>
                <div className="number">{time.sec.toString().padStart(2, 0)}</div>
              </>
              }
              {
                config.digitalClock.mode == 12 && <div className="suffix" style={{ fontSize: isConfig ? '3vh' : '20vh' }}>{time.hour >= 12 ? 'PM' : 'AM'}</div>
              }
            </div>
          </div>
      }

    </>
  )
}