<template>
  <div v-compress-text class="compress-text">
    <template v-for="item in textList">
      <span
        v-if="typeof item === 'object'"
        class="ruby"
        :class="{'text-gradient': gradient}"
        :style="textStyle"
        :data-card-name="item.ruby"
      >{{ item.ruby }}<span v-compress-rt class="rt">{{ item.rt }}</span></span>
      <span
        v-else
        v-no-compress="noCompressText.includes(item)"
        class="ruby"
        :class="{'text-gradient': gradient}"
        :style="textStyle"
        :data-card-name="item"
      >{{ item }}</span>
    </template>
  </div>
</template>

<script>
  export default {
    name: 'CompressText',
    props: ['text', 'gradient', 'gradientColor1', 'gradientColor2', 'width', 'height', 'language', 'refreshKey', 'autoSizeElement'],
    data() {
      return {
        noCompressText: '●①②③④⑤⑥⑦⑧⑨⑩',
        textScale: 1,
      };
    },
    computed: {
      textList() {
        return this.text.trimEnd().replace(new RegExp(`\\[(.*?)\\((.*?)\\)]|[${this.noCompressText}]`, 'g'), s => `|${s}|`)
          .split('|').filter(value => value).map(value => {
            if (/\[.*?\(.*?\)]/g.test(value)) {
              return {
                ruby: value.replace(/\[(.*?)\((.*?)\)]/g, '$1'),
                rt: value.replace(/\[(.*?)\((.*?)\)]/g, '$2'),
              };
            }
            return value;
          });
      },
      textStyle() {
        if (this.gradient) {
          const color1 = this.gradientColor1 || '#999999';
          const color2 = this.gradientColor2 || '#ffffff';
          return {
            backgroundImage: `-webkit-linear-gradient(top, ${color1}, ${color2}, ${color1})`,
          };
        }
        return {};
      },
    },
    watch: {
      refreshKey() {
        // 强制刷新
        setTimeout(() => {
          this.$forceUpdate();
        });
      },
      textScale(newVal, oldVal) {
        // 防止抖动
        if (Math.abs(newVal - oldVal) > 0.01) {
          setTimeout(() => {
            this.$forceUpdate();
          });
        }
      },
    },
    directives: {
      // 压缩或拉伸注音文字
      compressRt(el, binding) {
        const that = binding.instance;
        let ruby = el.parentNode;
        let rt = el;
        ruby.style.margin = '';
        rt.style.textAlignLast = '';
        rt.style.transform = '';
        rt.style.left = '';
        rt.style.width = '';

        let text = ruby.innerText.split('\n')[0];
        let rubyWidth = ruby.offsetWidth;
        let rtWidth = rt.offsetWidth / that.textScale;
        if (rtWidth / rubyWidth < 0.9 && text.length > 1) {
          // 拉伸两端对齐
          rt.style.width = `${that.textScale * 90}%`;
          rt.style.left = '5%';
          rt.style.textAlignLast = 'justify';
          rt.style.transform = `scaleX(${1 / that.textScale})`;
        } else if (rtWidth > rubyWidth) {
          // 压缩
          if (rubyWidth / rtWidth < 0.6) {
            // 防止过度压缩，加宽ruby
            // 公式：(rubyWidth + widen) / rtWidth = 0.6
            let widen = 0.6 * rtWidth - rubyWidth;
            ruby.style.margin = `0 ${widen / 2}px`;
            rt.style.left = `-${widen / 2}px`;
            rt.style.transform = `scaleX(${(rubyWidth + widen) / rtWidth / that.textScale})`;
          } else {
            rt.style.transform = `scaleX(${rubyWidth / rtWidth / that.textScale})`;
          }
        } else {
          // 不变并居中
          rt.style.left = `${(rubyWidth - rtWidth) / 2}px`;
          rt.style.transform = `scaleX(${1 / that.textScale})`;
        }
      },
      // 压缩文本文字
      compressText(el, binding) {
        const that = binding.instance;
        if (that.width && that.height) {
          el.style.width = `${that.width}px`;
          el.style.transform = '';
          el.style.textAlignLast = '';
          that.textScale = 1;
          const yugiohCardElement = document.querySelector('.yugioh-card');
          const descriptionZoom = Number(yugiohCardElement.style.getPropertyValue('--descriptionZoom'));
          let autoSizeElement = document.querySelector(that.autoSizeElement);
          autoSizeElement?.classList.remove('small-description');

          if (el.clientHeight > that.height) {
            // 用二分法获取最大的scale，精度0.01
            let scale = 0.5;
            let start = 0;
            let end = 1;
            while (scale > 0) {
              scale = (start + end) / 2;
              el.style.width = `${that.width / scale}px`;
              el.style.transform = `scaleX(${scale})`;
              el.style.textAlignLast = 'justify';
              that.textScale = scale;
              el.clientHeight > that.height ? end = scale : start = scale;
              if (el.clientHeight <= that.height && end - start <= 0.01) {
                // 如果是英文，灵摆和效果栏字体判断缩小，当字号大于1不执行
                if (that.language === 'en' && that.autoSizeElement && scale < 0.7 &&
                  descriptionZoom === 1 && !autoSizeElement?.classList.contains('small-description')) {
                  autoSizeElement?.classList.add('small-description');
                  scale = 0.5;
                  start = 0;
                  end = 1;
                } else {
                  break;
                }
              }
            }
          }
        }
      },
      // 不压缩的文本
      noCompress(el, binding) {
        el.style.display = '';
        el.style.transform = '';
        el.style.margin = '';
        if (binding.value) {
          const that = binding.instance;
          el.style.display = 'inline-block';
          el.style.transform = `scaleX(${1 / that.textScale})`;
          el.style.margin = `0 ${(1 - that.textScale) / 2 * 36}px`;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .compress-text {
    transform-origin: 0 0;

    .ruby {
      position: relative;

      .rt {
        font-family: ygo-tip, sans-serif;
        font-size: 12px;
        font-weight: bold;
        position: absolute;
        left: 0;
        text-align: center;
        white-space: pre;
        letter-spacing: 0;
        transform-origin: 0 0;
        -webkit-background-clip: unset;
        -webkit-text-fill-color: initial;
      }
    }

    .text-gradient {
      display: inline-block;
      position: relative;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      // 反光
      &:before {
        content: attr(data-card-name);
        position: absolute;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-image: linear-gradient(135deg, transparent 48%, white 50%, transparent 52%);
        background-size: 400% 100%;
        animation: gradient-reflection 3s ease infinite;
        top: 0;
        left: 0;
      }

      // 阴影
      &:after {
        content: attr(data-card-name);
        position: absolute;
        -webkit-text-stroke: 6px rgba(0, 0, 0, 0.6);
        text-shadow: 3px 5px 1px rgba(0, 0, 0, 0.6);
        z-index: -10;
        top: 0;
        left: 0;
      }
    }
  }

  @keyframes gradient-reflection {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
</style>
