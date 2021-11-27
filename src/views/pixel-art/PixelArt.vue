<template>
  <div class="pixel-art-container">
    <Page>
      <template #default>
        <div class="pixel-art">
          <canvas ref="canvas" />
          <!--hoverCanvas用来渲染悬浮边框-->
          <canvas ref="hoverCanvas" class="hover-canvas" />
        </div>
      </template>

      <template #form>
        <PageForm title="单帧编辑">
          <el-button-group class="form-bar">
            <el-button size="small" :disabled="!historyList.length" @click="undoHistory">
              <i class="fas fa-undo" />
            </el-button>
            <el-popconfirm title="是否清空画板？" @confirm="clearPixelArt">
              <template #reference>
                <el-button type="danger" size="small">
                  <i class="fas fa-trash" />
                </el-button>
              </template>
            </el-popconfirm>
          </el-button-group>

          <el-form :model="form" label-width="auto" size="small">
            <el-form-item label="工具" class="form-items">
              <el-space :size="10" wrap>
                <el-check-tag :checked="form.type === 'pencil'" @change="changeType('pencil')">铅笔</el-check-tag>
                <el-check-tag :checked="form.type === 'eraser'" @change="changeType('eraser')">橡皮擦</el-check-tag>
                <el-check-tag :checked="form.type === 'absorber'" @change="changeType('absorber')">吸色器</el-check-tag>
              </el-space>
            </el-form-item>
            <el-form-item label="颜色-预制" class="form-items">
              <el-space :size="10" wrap>
                <!--
                <el-check-tag :checked="form.color === 'rgba(255,0,0,1)'" @change="changeColor('rgba(255,0,0,1)')">红</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(255,255,0,1)'" @change="changeColor('rgba(255,255,0,1)')">黄</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,255,0,1)'" @change="changeColor('rgba(0,255,0,1)')">绿</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,255,255,1)'" @change="changeColor('rgba(0,255,255,1)')">青</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,0,255,1)'" @change="changeColor('rgba(0,0,255,1)')">蓝</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(255,0,255,1)'" @change="changeColor('rgba(255,0,255,1)')">紫</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,0,0,1)'" @change="changeColor('rgba(0,0,0,1)')">黑</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(255,255,255,1)'" @change="changeColor('rgba(255,255,255,1)')">白</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,0,0,0)'" @change="changeColor('rgba(0,0,0,0)')">不亮</el-check-tag>
                -->
                <el-check-tag :checked="form.color === 'rgba(255,0,0,1)'" @change="changeColor('rgba(255,0,0,1)')">红</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(255,255,0,1)'" @change="changeColor('rgba(255,255,0,1)')">黄</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,255,0,1)'" @change="changeColor('rgba(0,255,0,1)')">绿</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,255,255,1)'" @change="changeColor('rgba(0,255,255,1)')">青</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(0,0,255,1)'" @change="changeColor('rgba(0,0,255,1)')">蓝</el-check-tag>
                <el-check-tag :checked="form.color === 'rgba(255,255,255,1)'" @change="changeColor('rgba(255,255,255,1)')">不亮</el-check-tag>
              </el-space>
            </el-form-item>
            <el-form-item label="颜色-调色板" class="form-items">
              <el-color-picker v-model="form.color" show-alpha />
            </el-form-item>
            <el-form-item label="时长" class="form-items">
              <el-input-number
                v-model="currentFrame.frameTime"
                :min="1"
                :max="256"
              />
              <span class="tip">(暂时是秒/以后会是毫秒)</span>
            </el-form-item>
          </el-form>

          <div class="button-group">
            <el-row :gutter="10">
              <el-button
                :icon="CaretLeft"
                circle
                type="primary"
                @click="caretLeft"
              />
              <el-button
                :icon="CaretRight"
                circle
                type="primary"
                @click="caretRight"
              />
              <el-button
                :icon="CaretTop"
                circle
                type="primary"
                @click="caretTop"
              />
              <el-button
                :icon="CaretBottom"
                circle
                type="primary"
                @click="caretBottom"
              />
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24">
                <el-button
                  plain
                  type="primary"
                  size="medium"
                  @click="exportImage"
                >
                  导出图片
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24">
                <el-button
                  disabled
                  plain
                  type="primary"
                  size="medium"
                  @click="getNewJson"
                >
                  导出数据
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24">
                <el-button
                  disabled
                  plain
                  type="primary"
                  size="medium"
                  @click="getNewJson"
                >
                  查看数据
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="24">
                <el-input v-model="form.jsonData" autosize type="textarea" />
              </el-col>
            </el-row>
          </div>
        </PageForm>
      </template>

      <template #frame>
        <PageFrame title="帧管理">
          <el-form :model="form" label-width="auto" size="small">
            <el-form-item label="列数量" class="form-items">
              <el-input-number
                v-model="form.widthPixel"
                :min="1"
                :max="128"
                :precision="0"
              />
              <span class="tip">(灯珠)</span>
            </el-form-item>
            <el-form-item label="行数量" class="form-items">
              <el-input-number
                v-model="form.heightPixel"
                :min="1"
                :max="128"
                :precision="0"
              />
              <span class="tip">(灯珠)</span>
            </el-form-item>
            <el-form-item label="间距" class="form-items">
              <el-input-number
                v-model="form.side"
                :min="0"
                :max="128"
                :precision="0"
              />
              <span class="tip">(像素)</span>
            </el-form-item>
            <el-form-item label="形状" class="form-items">
              <el-radio-group v-model="form.shape">
                <el-radio-button label="square">方形</el-radio-button>
                <el-radio-button label="round">圆形</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="黑白" class="form-items">
              <el-switch v-model="form.monochrome" />
            </el-form-item>
            <el-form-item label="网格" class="form-items">
              <el-switch v-model="form.grid" />
            </el-form-item>
            <el-form-item label="缩放(像素)" class="form-items">
              <el-slider v-model="form.size" :min="1" :max="100" />
            </el-form-item>
          </el-form>
          <el-divider />
          <div class="button-group">
            <el-form :model="form" label-width="auto" size="small">
              <el-form-item
                label="帧列表"
                class="form-items"
              >
                <el-space :size="10" wrap>
                  <el-check-tag
                    v-for="(_, index) in frameLists"
                    :key="'frame' + index"
                    :checked="currentFrameIndex === index"
                    @change="changeFrame(index)"
                  >
                    {{ 1 + index }}
                  </el-check-tag>
                </el-space>
              </el-form-item>
            </el-form>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-button size="medium" type="primary" @click="addFrame()">增加一帧</el-button>
              </el-col>
              <el-col :span="12">
                <el-button size="medium" type="danger" @click="deleteFrame()">删除当前帧</el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-button
                  plain
                  size="medium"
                  type="primary"
                  @click="playFrames(1)"
                >
                  {{ buttonPlayLabel1 }}
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button
                  plain
                  size="medium"
                  type="primary"
                  @click="playFrames(0)"
                >
                  {{ buttonPlayLabel0 }}
                </el-button>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-upload
                  action="/"
                  :show-file-list="false"
                  accept="application/json"
                  :before-upload="importJson"
                >
                  <el-button plain disabled size="medium">导入数据</el-button>
                </el-upload>
              </el-col>
              <el-col :span="12">
                <el-button
                  plain
                  size="medium"
                  @click="exportTmpJson"
                >
                  导出数据
                </el-button>
              </el-col>
            </el-row>
          </div>
        </PageFrame>
      </template>
    </Page>
  </div>
</template>

<script>
  import Page from '@/components/page/Page';
  import PageForm from '@/components/page/PageForm';
  import PageFrame from '@/components/page/PageFrame';
  import { computed, getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
  import { ElMessage } from 'element-plus';
  import { CaretLeft, CaretTop, CaretBottom, CaretRight }from '@element-plus/icons';
  import html2canvas from 'html2canvas';
  import _ from 'lodash';
  import usePixel from './use-pixel';

  export default {
    name: 'PixelArt',
    components: {
      Page,
      PageForm,
      PageFrame,
    },
    setup() {
      const { proxy } = getCurrentInstance();
      const canvas = ref(null);
      const context = ref(null);
      const hoverCanvas = ref(null);
      const hoverContext = ref(null);
      let form = reactive({
        heightPixel: 5,
        widthPixel: 36,
        type: 'pencil',
        shape: 'square',
        color: 'rgba(255,255,255,1)', // 白色表示不亮
        // color: 'rgba(0,0,0,0)', // 不亮,默认颜色或整体颜色
        monochrome: false,
        grid: true,
        size: 5,
        side: 5,
        jsonData: '',
      });
      const currentFrameIndex = ref(0);
      const frameLists = ref([ // 帧列表
        {
          color: [0,0,0,0], // 单色模式使用
          frameTime: 1, // 临时是秒
          dotList: [],
        },
      ]);
      const currentFrame = ref( {
        color: [0,0,0,0], // 单色模式使用
        frameTime: 1,
        dotList: [],
      }); // 当前帧
      const buttonPlayLabel0 = ref('循环播放');
      const buttonPlayLabel1 = ref('播放一次');
      const playStatus = ref(0); // 0 未播放 1 播放一次播放中 2 循环播放播放中
      const defaultColor = [255, 255, 255, 1]; // 白色默认不亮
      const historyList = ref([]);
      const downDot = ref({}); // 鼠标按下的点
      const lastDot = ref({}); // 上一个移动的点
      const currentDot = ref({}); // 鼠标当前所在点
      const lineWidth = computed(() => form.grid ? 1 : 0);
      const pixel = computed(() => form.size);
      const isMousedown = ref(false);

      onMounted(() => {
        context.value = canvas.value.getContext('2d');
        hoverContext.value = hoverCanvas.value.getContext('2d');
        createDotList();
        canvas.value.addEventListener('mousemove', onMousemove);
        canvas.value.addEventListener('mouseleave', onMouseleave);
        canvas.value.addEventListener('mousedown', onMousedown);
        document.addEventListener('mouseup', onMouseup);
        addEventListener('keydown', registerShortcut);
      });

      onBeforeUnmount(() => {
        canvas.value.removeEventListener('mousemove', onMousemove);
        canvas.value.removeEventListener('mouseleave', onMouseleave);
        canvas.value.removeEventListener('mousedown', onMousedown);
        document.removeEventListener('mouseup', onMouseup);
        removeEventListener('keydown', registerShortcut);
      });

      const createDotList = () => {
        const pixelX = form.widthPixel;
        const pixelY = form.heightPixel;
        // const defaultColor = [255, 255, 255, 0];

        const list = new Array(pixelY).fill(null).map(() => new Array(pixelX).fill(defaultColor));
        list.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            list[rowIndex][colIndex] = currentFrame.value?.dotList?.[rowIndex]?.[colIndex] || col;
          });
        });
        currentFrame.value.dotList = list;
        renderCanvas();
      };

      const renderCanvas = () => {
        // canvas.value.width = form.widthPixel * pixel.value + lineWidth.value; // beiji
        // canvas.value.height = form.heightPixel * pixel.value + lineWidth.value; // beiji
        canvas.value.width = form.widthPixel * pixel.value + lineWidth.value + form.side * (form.widthPixel - 1);
        canvas.value.height = form.heightPixel * pixel.value + lineWidth.value + form.side * (form.heightPixel - 1);
        hoverCanvas.value.width = canvas.value.width;
        hoverCanvas.value.height = canvas.value.height;

        currentFrame.value.dotList.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            addDot(rowIndex, colIndex, col);
          });
        });
      };

      // 鼠标移动光标
      const renderHoverCanvas = () => {
        hoverContext.value.clearRect(0, 0, hoverCanvas.value.width, hoverCanvas.value.height);

        if (Object.keys(currentDot.value).length) {
          const rowIndex = currentDot.value.x;
          const colIndex = currentDot.value.y;
          hoverContext.value.lineWidth = lineWidth.value;
          hoverContext.value.fillStyle = 'rgba(64, 158, 255, 0.2)';
          hoverContext.value.strokeStyle = '#409eff';

          if (form.shape === 'square') {
            // const x = colIndex * pixel.value + lineWidth.value / 2; // beiji
            // const y = rowIndex * pixel.value + lineWidth.value / 2; // beiji
            const x = colIndex * pixel.value + lineWidth.value / 2 + colIndex * form.side; // beiji
            const y = rowIndex * pixel.value + lineWidth.value / 2 + rowIndex * form.side; // beiji
            const w = pixel.value;
            const h = pixel.value;
            hoverContext.value.fillRect(x, y, w, h);
            hoverContext.value.strokeRect(x, y, w, h);
          } else if (form.shape === 'round') {
            // const x = colIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2; // beiji
            // const y = rowIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2; // beiji
            const x = colIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2 + colIndex * form.side; // beiji
            const y = rowIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2 + rowIndex * form.side; // beiji
            const radius = pixel.value / 2;
            const startAngle = 0;
            const endAngle = Math.PI * 2;
            hoverContext.value.beginPath();
            hoverContext.value.arc(x, y, radius, startAngle, endAngle);
            hoverContext.value.fill();
            hoverContext.value.stroke();
          }
        }
      };

      const addDot = (rowIndex, colIndex, color) => {
        // context.value.clearRect(colIndex * pixel.value, rowIndex * pixel.value, pixel.value, pixel.value); // beiji
        context.value.clearRect(colIndex * pixel.value + colIndex * form.side, rowIndex * pixel.value + rowIndex * form.side, pixel.value, pixel.value); // beiji
        context.value.lineWidth = lineWidth.value;
        context.value.strokeStyle = '#dcdfe6';

        if (form.monochrome) {
          let rgb = Math.round((color[0] + color[1] + color[2]) / 3);
          context.value.fillStyle = `rgba(${rgb},${rgb},${rgb},${color[3]})`;
        } else {
          context.value.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
        }

        if (form.shape === 'square') {
          // const x = colIndex * pixel.value + lineWidth.value / 2; // beiji
          // const y = rowIndex * pixel.value + lineWidth.value / 2; // beiji
          const x = colIndex * pixel.value + lineWidth.value / 2 + colIndex * form.side; // beiji
          const y = rowIndex * pixel.value + lineWidth.value / 2 + rowIndex * form.side; // beiji
          const w = pixel.value;
          const h = pixel.value;
          context.value.fillRect(x, y, w, h);
          if (form.grid) {
            context.value.strokeRect(x, y, w, h);
          }
        } else if (form.shape === 'round') {
          // const x = colIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2; // beiji
          // const y = rowIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2; // beiji
          const x = colIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2 + colIndex * form.side; // beiji
          const y = rowIndex * pixel.value + pixel.value / 2 + lineWidth.value / 2 + rowIndex * form.side; // beiji
          const radius = pixel.value / 2;
          const startAngle = 0;
          const endAngle = Math.PI * 2;
          context.value.beginPath();
          context.value.arc(x, y, radius, startAngle, endAngle);
          context.value.fill();
          if (form.grid) {
            context.value.stroke();
          }
        }
      };

      const changeType = type => {
        form.type = type;
      };

      // beiji 使用与预制色修改
      const changeColor = color => {
        form.color = color;
        currentFrame.value.color = color;
      };

      const clearPixelArt = () => {
        currentFrame.value.dotList = [];
        createDotList();
      };

      const usePixelKey = {
        form,
        currentFrame,
        downDot,
        lastDot,
        currentDot,
        isMousedown,
        addDot,
      };

      const onMousemove = e => {
        // 算式：const x = colIndex * pixel.value + lineWidth.value;
        //       const y = rowIndex * pixel.value + lineWidth.value;
        // const x = colIndex * pixel.value + lineWidth.value + colIndex * form.side; // beiji
        // const y = rowIndex * pixel.value + lineWidth.value + rowIndex * form.side; // beiji
        const x = e.offsetX;
        const y = e.offsetY;
        // const colIndex = Math.floor((x - lineWidth.value) / pixel.value); // beiji
        // const rowIndex = Math.floor((y - lineWidth.value) / pixel.value); // beiji
        const colIndex = Math.floor((x - lineWidth.value) / (pixel.value + form.side));
        const rowIndex = Math.floor((y - lineWidth.value) / (pixel.value + form.side));
        if (colIndex < 0 || rowIndex < 0) {
          return;
        }
        lastDot.value = Object.keys(currentDot.value).length ? _.cloneDeep(currentDot.value) : { x: rowIndex, y: colIndex };
        currentDot.value = { x: rowIndex, y: colIndex };
        if (!_.isEqual(lastDot.value, currentDot.value)) {
          usePixel(usePixelKey, form.type);
        }
      };

      const onMouseleave = () => {
        currentDot.value = {};
      };

      const onMousedown = () => {
        isMousedown.value = true;
        downDot.value = _.cloneDeep(currentDot.value);
        saveHistory();
        usePixel(usePixelKey, form.type);

        document.onselectstart = () => false;
        document.ondragstart = () => false;
      };

      const onMouseup = () => {
        isMousedown.value = false;

        document.onselectstart = null;
        document.ondragstart = null;
      };

      const saveHistory = () => {
        historyList.value.push(_.cloneDeep(currentFrame.value.dotList));
      };

      const undoHistory = () => {
        const history = historyList.value.pop();
        if (history) {
          currentFrame.value.dotList = history;
          createDotList();
        }
      };

      const registerShortcut = e => {
        if (document.activeElement.nodeName === 'INPUT') {
          return;
        }

        const { ctrlKey, key } = e;
        if (ctrlKey && key === 'z') {
          undoHistory();
          e.preventDefault();
        }
      };

      // 原导入数据
      const importJson = file => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e => {
          try {
            let data = JSON.parse(e.target?.result);
            form = Object.assign(form, data.form);
            currentFrame.value.dotList = data.dotList;
            createDotList();
          } catch (e) {
            this.$message.error('数据导入失败');
          }
        });
      };

      // beiji 生成json
      const createTmpJson = () => {
        // let data = JSON.stringify({
        //  dotList: dotList.value,
        // });
        let data = '66880101'; // 66 协议头 88 协议头 01 类型 01 组(组暂时没起作用)
        data = data +'0' + frameLists.value.length.toString(); // 目前最多4帧 01红 02绿  04青 05黄 07蓝
        let color = ''; // 颜色数据
        let frameTime = ''; // 时间数据
        let timeType = ''; // 时间类型
        frameLists.value.forEach((fvalue,findex) => {
          // 解决一个图形的颜色、时间
          let fcolString = fvalue.color.toString();
          switch(fcolString){
          case '255,0,0,1': // 红
            color = color + '01';
            break;
          case '255,255,0,1': // 黄
            color = color + '05';
            break;
          case '0,255,0,1': // 绿
            color = color + '02';
            break;
          case '0,255,255,1': // 青
            color = color + '04';
            break;
          case '0,0,255,1': // 蓝
            color = color + '07';
            break;
          }
          let ft16 = fvalue.frameTime.toString(16); // 十六机制
          if (ft16.length < 2){
            ft16 = '0' + ft16; // 不够两位补一位0
          }
          frameTime = frameTime + ft16; // 要十六机制
          timeType = timeType + '01'// 01是秒 00是毫秒 临时都是秒
          // 转换一列灯珠数据
          let colData = new Array(36); // 36列二进制字符串 每个5位
          colData.fill('');
          fvalue.dotList.forEach((row, rowIndex) => { // 5行
            row.forEach((col, colIndex) => { // 36列
              if (col.toString() === '255,255,255,1'){ // 临时白表示不亮
                colData[colIndex] = colData[colIndex] + '0';
              }else{
                colData[colIndex] = colData[colIndex] + '1';
              }
            })
          });
          colData.forEach( (cValue, cIndex) => { // 36列二进制转十六进制
            console.log('cIndex:'+cIndex);
            console.log('colValue:'+cValue);
            let s16 = parseInt(cValue,2).toString(16);// 2转10再转16
            if (s16.length < 2){
              s16 = '0' + s16; // 不够两位补一位0
            }
            data = data + s16;
          })
        });
        /*
        currentFrame.value.dotList.forEach((row, rowIndex) => {
          row.forEach((col, colIndex) => {
            let dColor = '';
            let colString = col.toString()
            switch(colString){
            case '255,0,0,1': // 红
              dColor = '0x01';
              break;
            case '255,255,0,1': // 黄
              dColor = '0x02';
              break;
            case '0,255,0,1': // 绿
              dColor = '0x03';
              break;
            case '0,255,255,1': // 青
              dColor = '0x04';
              break;
            case '0,0,255,1': // 蓝
              dColor = '0x05';
              break;
            case '255,0,255,1': // 紫
              dColor = '0x06';
              break;
            case '255,255,255,1': // 白
              dColor = '0x07';
              break;
            case '0,0,0,1': // 黑
              dColor = '0x08';
              break;
            default: // '0,0,0,0': // 不亮
              dColor = '0x00';
            }
            data = data + ' ' + dColor;
          });
        });
        */
        data = data + color + frameTime + timeType + '0805';// 08 校验位 05 校验位
        return data;
      }

      // beiji 获取json
      const getNewJson = () => {
        form.jsonData = createTmpJson();
      }

      // beiji 输出json
      const exportTmpJson = () => {
        frameLists.value[currentFrameIndex.value] = currentFrame.value;// 存储当前帧
        let data = createTmpJson();
        let blob = new Blob([data], { type: 'application/json' });
        proxy.downloadBlob(blob, '像素编辑');
      };

      // 原输出数据
      const exportJson = () => {
        let data = JSON.stringify({
          form,
          dotList: currentFrame.value.dotList,
        });
        let blob = new Blob([data], { type: 'application/json' });
        proxy.downloadBlob(blob, '像素编辑');
      };

      // 导出图片
      const exportImage = () => {
        let element = document.querySelector('.pixel-art');
        html2canvas(element, {
          backgroundColor: 'transparent',
        }).then(canvas => {
          canvas.toBlob(blob => {
            proxy.downloadBlob(blob, '像素编辑');
          });
        });
      };

      // 帧处理相关
      const changeFrame = index => {
        frameLists.value[currentFrameIndex.value] = currentFrame.value;
        currentFrameIndex.value = index;
        currentFrame.value = frameLists.value[index];
        createDotList();
      }
      // 增加帧
      const addFrame = () => {
        frameLists.value.push({
          color: [0,0,0,0],
          frameTime: 0,
          dotList: [],
        })
      }
      // 删除帧
      const deleteFrame = () => {
        let fLenght = frameLists.value.length;
        if (fLenght == 1){
          ElMessage({
            message: '只有一帧不能删除!',
            type: 'warning',
          })
          return
        }
        frameLists.value.splice(currentFrameIndex.value,1);
        if (currentFrameIndex.value == (fLenght - 1)){ // 最后一个索引时处理索引
          currentFrameIndex.value = currentFrameIndex.value - 1;
          currentFrame.value = frameLists.value[ currentFrameIndex.value ];
        }else{// 非最后一个索引时，索引值没变化，需要手动刷新canvas
          currentFrame.value = frameLists.value[currentFrameIndex.value];
          createDotList();
        }
      }

      // 播放帧动画
      // todo 状态更新待抽象
      const playFrames = ptimes => {
        switch (playStatus.value){
        case 0: // 未播放
          frameLists.value[currentFrameIndex.value] = currentFrame.value;// 存储当前帧
          buttonPlayLabel0.value = '停止播放'; // 按钮文字
          buttonPlayLabel1.value = '停止播放'; // 按钮文字
          switch (ptimes){
          case 0: // 循环播放
            playStatus.value = 2; // 更新播放状态
            break;
          case 1: // 播放一次
            playStatus.value = 1; // 更新播放状态
            break;
          }
          // 递归播放
          const _play = (values, index = 0) => {
            const frame = values[index];
            playFrame(index).then(() => {
              let nextIndex = index + 1;
              if ((nextIndex === values.length && ptimes === 1) || playStatus.value ===0) {// 播放一次到最后一帧 或停止播放
                console.log(/播放完毕/);
                buttonPlayLabel0.value = '循环播放'; // 按钮文字
                buttonPlayLabel1.value = '播放一次'; // 按钮文字
                playStatus.value = 0; // 更新播放状态
              } else {
                if (nextIndex === values.length){ // 循环播放到最后一帧
                  nextIndex = 0;
                }
                setTimeout(() => {
                  _play(frameLists.value, nextIndex)
                }, frame.frameTime * 1000);// 临时是秒
              }
            })
          }
          _play(frameLists.value);
          break;
        case 1:
        case 2: // 播放中
          buttonPlayLabel0.value = '循环播放'; // 按钮文字
          buttonPlayLabel1.value = '播放一次'; // 按钮文字
          playStatus.value = 0; // 更新播放状态
          break;
        }
      }

      // 播放一帧
      const playFrame = index => {
        return new Promise(res => {
          console.log(/playFrame index:/, index);
          currentFrameIndex.value = index;
          currentFrame.value = frameLists.value[index];
          createDotList();
          res()
        })
      }

      // 帧移动处理
      const caretLeft = () => {
        currentFrame.value.dotList.forEach((row, rowIndex) => { // 5行
          let first = currentFrame.value.dotList[rowIndex].shift();
          currentFrame.value.dotList[rowIndex].push(first);
        });
        createDotList();
      }

      const caretRight = () => {
        currentFrame.value.dotList.forEach((row, rowIndex) => { // 5行
          let last = currentFrame.value.dotList[rowIndex].pop();
          currentFrame.value.dotList[rowIndex].splice(0,0,last);
        });
        createDotList();
      }

      const caretTop = () => {
        let first = currentFrame.value.dotList.shift();
        currentFrame.value.dotList.push(first);
        createDotList();
      }

      const caretBottom = () => {
        let last = currentFrame.value.dotList.pop();
        currentFrame.value.dotList.splice(0,0,last);
        createDotList();
      }

      watch(() => {
        const { heightPixel, widthPixel, shape, monochrome, grid, size, side } = form;
        return { heightPixel, widthPixel, shape, monochrome, grid, size, side };
      }, () => {
        createDotList();
      });

      watch(currentDot, (newVal, oldVal) => {
        if (!_.isEqual(newVal, oldVal)) {
          renderHoverCanvas();
        }
      });

      return {
        canvas,
        context,
        hoverCanvas,
        hoverContext,
        form,
        currentFrame,
        buttonPlayLabel0,
        buttonPlayLabel1,
        currentFrameIndex,
        frameLists,
        historyList,
        CaretLeft,
        CaretRight,
        CaretTop,
        CaretBottom,
        changeType,
        clearPixelArt,
        undoHistory,
        importJson,
        exportJson,
        exportImage,
        changeColor,
        createTmpJson,
        getNewJson,
        exportTmpJson,
        changeFrame,
        addFrame,
        deleteFrame,
        playFrames,
        caretLeft,
        caretRight,
        caretTop,
        caretBottom,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .pixel-art-container {
    .pixel-art {
      display: inline-flex;
      flex-wrap: wrap;
      vertical-align: top;
      position: relative;

      .hover-canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 10;
      }
    }

    .form-main {
      .form-bar {
        margin-bottom: 1px;
        padding: 10px;
      }

      .button-group {
        .el-row {
          margin-bottom: 10px;
          .el-col {
            ::v-deep(.el-upload) {
              width: 100%;
            }

            .el-button {
              margin-bottom: 10px;
              width: 100%;
            }
          }
        }
      }
    }

    .frame-main {
      .button-group {
        .el-row {
          margin-top: 10px;

          .el-col {
            ::v-deep(.el-upload) {
              width: 100%;
            }

            .el-button {
              width: 100%;
            }

            .bs-title {
              margin-top: 50px;
            }
          }
        }
      }
    }
  }
</style>
