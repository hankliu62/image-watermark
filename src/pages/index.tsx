import AOS from 'aos';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { WatermarkProps } from '@hankliu/hankliu-ui';
import {
  Card,
  Tooltip,
  Breadcrumb,
  Button,
  InputNumber,
  FileSelect,
  Input,
  ColorPicker,
  Slider,
  Space,
  message,
  Watermark,
  HlImage,
  Popover,
} from '@hankliu/hankliu-ui';
import {
  DeleteOutlined,
  FileImageFilled,
  InfoCircleOutlined,
  PictureFilled,
  SettingFilled,
} from '@hankliu/icons';
import { useRouter } from 'next/router';
import type { ColorPickerValue } from '@hankliu/hankliu-ui/lib/color-picker';
import classNames from 'classnames';
import html2canvas from 'html2canvas';

import { PageTitle } from '@/constants';
import useBreadcrumb from '@/hooks/useBreadcrumb';
import { parseRgbStr } from '@hankliu/hankliu-ui/lib/color-picker/util';

/**
 * 图片水印
 *
 * @returns
 */
export default function Index() {
  const router = useRouter();
  // 图片文件
  const [file, setFile] = useState<File>();
  // 图片地址
  const [imageUrl, setImageUrl] = useState<string>('');
  // 水印文字
  const [imageName, setImageName] = useState<string>('Image');
  // 水印文字
  const [content, setContent] = useState<string>(PageTitle);
  // 字体颜色
  const [color, setColor] = useState<ColorPickerValue>('#000000');
  // 字体大小
  const [fontSize, setFontSize] = useState<number>(18);
  // 透明度
  const [opacity, setOpacity] = useState<number>(100);
  // 旋转角度
  const [rotate, setRotate] = useState<number>(-22);
  // 文本间距
  const [gap, setGap] = useState<[number, number]>([100, 100]);
  // 偏移量
  const [offset, setOffset] = useState<[number | undefined, number | undefined]>();
  // 是否正在生成
  const [isCreating, setIsCreating] = useState<boolean>(false);
  // 是否预览水印图片
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  // 预览图片容器
  const container = useRef<HTMLDivElement>(null);

  // 点击面包屑
  const onClickBreadcrumb = useBreadcrumb();

  /**
   * 预览水印图片
   *
   * @returns
   */
  const onStartPreview = useCallback(() => {
    if (!file) {
      message.error('请上传图片');
      return;
    }

    if (!content) {
      message.error('请输入水印文字');
      return;
    }

    setIsPreviewing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      setImageUrl((e.currentTarget as any).result as unknown as string);
      setIsPreviewing(false);
    };

    reader.readAsDataURL(file);
  }, [file, content]);

  /**
   * 保存水印图片
   *
   * @returns
   */
  const onSaveImage = useCallback(() => {
    if (!file) {
      message.error('请上传图片');
      return;
    }

    if (!content) {
      message.error('请输入水印文字');
      return;
    }

    if (!imageUrl) {
      message.error('请先预览水印图片');
      return;
    }

    if (!imageName) {
      message.error('请输入保存图片名称');
      return;
    }

    setIsCreating(true);

    html2canvas(container.current!).then((canvas) => {
      // Convert canvas to Blob
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${imageName}.png`;
        a.click();
        setIsCreating(false);
      });
    });
  }, [file, content, imageUrl, imageName]);

  /**
   * 上传图片
   * @param files
   */
  const onUploadFile = (files: File[]) => {
    if (files.length) {
      setFile(files[0]);
    } else {
      setFile(undefined);
    }
    setImageUrl(undefined);
  };

  // 水印属性
  const watermarkProps = useMemo<WatermarkProps>(() => {
    const currentColor = parseRgbStr(color as string);
    return {
      content,
      zIndex: 10,
      rotate,
      gap,
      offset,
      font: {
        color:
          `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${opacity / 100})` as any,
        fontSize,
      },
    };
  }, [content, color, fontSize, opacity, rotate, gap, offset]);

  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="relative w-full text-white/75">
      {!!router.query?.['with-breadcrumb'] && (
        <Breadcrumb className="!m-6 !text-base" separator="/">
          <Breadcrumb.Item>
            <a onClick={onClickBreadcrumb}>小工具集合</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{PageTitle.split('-').pop().trim()}</Breadcrumb.Item>
        </Breadcrumb>
      )}

      <div className="relative z-20 mx-auto mt-6 w-full max-w-[1920px]">
        <div className="flex flex-col flex-wrap">
          {/* 基本配置 */}
          <div
            data-aos="fade-up"
            data-aos-offset="200"
            data-aos-delay="50"
            data-aos-duration="1000"
            data-aos-easing="ease-in-out"
            data-aos-mirror="true"
            data-aos-once="true"
            className="info-card group relative flex w-full flex-col content-between justify-between gap-[24px] overflow-hidden rounded-[4px] p-[24px] ease-in"
          >
            <Card bordered className="relative shadow-lg">
              <Tooltip title="基本配置">
                <div className="absolute top-0 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded bg-[#1677ff]">
                  <SettingFilled className="text-[20px] text-white" />
                </div>
              </Tooltip>
              <div className="relative flex flex-col pt-4">
                {/* 上传图片 */}
                <div className="flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">上传图片</label>
                  </div>
                  <div className="mt-2 w-full">
                    <FileSelect
                      multiple={false}
                      accept="image/*"
                      maxsize={5 * FileSelect.SIZE_MB}
                      onSelect={onUploadFile}
                    />
                  </div>
                  {!!file && (
                    <div className="group/image mt-4 flex items-center justify-start overflow-hidden">
                      <FileImageFilled className="text-xl text-green-400" />
                      <Popover
                        placement="topLeft"
                        content={
                          <HlImage
                            className="max-w-72"
                            width="100%"
                            src={URL.createObjectURL(file)}
                          />
                        }
                        trigger="hover"
                      >
                        <div className="mx-3 flex-1 truncate text-base">{file?.name}</div>
                      </Popover>
                      <DeleteOutlined
                        className="hidden h-[24px] cursor-pointer text-xl hover:text-red-600 group-hover/image:block"
                        onClick={() => setFile(undefined)}
                      />
                    </div>
                  )}
                </div>

                {/* 水印文字 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">水印文字</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Input
                      className="!w-full"
                      size="medium"
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                      }}
                      placeholder="请输入水印文字"
                    />
                  </div>
                </div>

                {/* 文字颜色 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">文字颜色</label>
                  </div>
                  <div className="mt-2 w-full">
                    <ColorPicker value={color} onChange={(val) => setColor(val)} />
                  </div>
                </div>

                {/* 字体大小 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">字体大小</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Slider
                      step={1}
                      min={1}
                      max={100}
                      value={fontSize}
                      onChange={(value) => setFontSize(value)}
                    />
                  </div>
                </div>

                {/* 透明度 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">透明度</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Slider
                      step={1}
                      min={0}
                      max={100}
                      value={opacity}
                      onChange={(value) => setOpacity(value)}
                    />
                  </div>
                </div>

                {/* 旋转角度 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">旋转角度</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Slider
                      step={1}
                      min={-180}
                      max={180}
                      value={rotate}
                      onChange={(value) => setRotate(value)}
                    />
                  </div>
                </div>

                {/* 文本间距 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">文本间距</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Space className="!grid w-1/2 grid-cols-2" size="small">
                      <InputNumber
                        className="!w-full"
                        size="large"
                        placeholder="请输入水平方向文本间距"
                        value={gap[0]}
                        onChange={(value) => setGap((prev) => [value, prev[1]])}
                      />
                      <InputNumber
                        className="!w-full"
                        size="large"
                        placeholder="请输入垂直方向文本间距"
                        value={gap[1]}
                        onChange={(value) => setGap((prev) => [prev[1], value])}
                      />
                    </Space>
                  </div>
                </div>

                {/* 文本偏移量 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">文本偏移量</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Space className="!grid w-1/2 grid-cols-2" size="small">
                      <InputNumber
                        className="!w-full"
                        size="large"
                        placeholder="请输入水平方向文本偏移量"
                        value={offset ? offset[0] : undefined}
                        onChange={(value) =>
                          setOffset((prev) => [value, prev ? prev[1] : undefined])
                        }
                      />
                      <InputNumber
                        className="!w-full"
                        size="large"
                        placeholder="请输入垂直方向文本偏移量"
                        value={offset ? offset[1] : undefined}
                        onChange={(value) =>
                          setOffset((prev) => [prev ? prev[0] : undefined, value])
                        }
                      />
                    </Space>
                  </div>
                </div>

                {/* 保存图片名称 */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-start">
                    <label className="mr-4 text-xl font-medium">保存图片名称</label>
                  </div>
                  <div className="mt-2 w-full">
                    <Input
                      className="!w-full"
                      size="medium"
                      value={imageName}
                      onChange={(e) => {
                        setImageName(e.target.value);
                      }}
                      placeholder="请输入保存图片名称"
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-start justify-center">
                  <Space size="middle">
                    <Button
                      loading={isPreviewing}
                      disabled={isPreviewing || isCreating}
                      size="medium"
                      type="primary"
                      onClick={onStartPreview}
                    >
                      预览图片
                    </Button>

                    <Button
                      loading={isCreating}
                      disabled={isPreviewing || isCreating}
                      size="medium"
                      type="primary"
                      onClick={onSaveImage}
                    >
                      保存到本地
                    </Button>
                  </Space>
                </div>
              </div>
            </Card>
          </div>

          {/* 预览水印图片 */}
          <div
            className={classNames(
              'info-card group relative hidden w-full flex-col content-between justify-between gap-[24px] overflow-hidden rounded-[4px] p-[24px] ease-in',
              {
                '!flex': !!file && imageUrl,
              },
            )}
          >
            <Card bordered className="relative shadow-lg">
              <Tooltip title="预览水印图片">
                <div className="absolute top-0 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded bg-[#1677ff]">
                  <PictureFilled className="text-[20px] text-white" />
                </div>
              </Tooltip>
              <div className="relative flex flex-col pt-4">
                <div className="mb-4 block w-full">
                  <div
                    className="preview-container relative inline-block text-[0px]"
                    ref={container}
                  >
                    <Watermark {...watermarkProps}>
                      <HlImage
                        className="preview-image inline-block"
                        src={imageUrl}
                        alt={file?.name}
                      />
                    </Watermark>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 使用说明 */}
          <div
            data-aos="fade-up"
            data-aos-offset="200"
            data-aos-delay="50"
            data-aos-duration="1000"
            data-aos-easing="ease-in-out"
            data-aos-mirror="true"
            data-aos-once="true"
            className="info-card group relative flex w-full flex-col content-between justify-between gap-[24px] overflow-hidden rounded-[4px] p-[24px] ease-in"
          >
            <Card bordered className="relative shadow-lg">
              <Tooltip title="使用说明">
                <div className="absolute top-0 flex h-[40px] w-[40px] -translate-y-1/2 items-center justify-center rounded bg-[#1677ff]">
                  <InfoCircleOutlined className="text-[20px] text-white" />
                </div>
              </Tooltip>
              <div className="relative grid grid-cols-1 gap-4 pt-4">
                <div className="text-base">数据仅供娱乐，请勿用于商业用途，责任自负。</div>
                <div className="text-base">
                  在这个充满瞬息万变与视觉故事的数字时代，保护和个性化您的图像变得尤为重要。我们的在线图片水印工具，宛如一位静默的艺术守护者，为您的每一张照片增添独特的印记。无论是摄影作品，设计杰作，还是生活的点滴瞬间，水印的存在不仅是对原创的尊重，更是一种风格的表达。
                </div>
                <div className="text-base">
                  操作简单直观，让您在轻松上手的同时，尽享创作的乐趣。多样化的字体、颜色和位置选择，使您的水印不仅仅是标记，更是一种艺术化的展示。无论您身在何处，只需连接网络，便可随时为您的图像增添一抹独特的色彩。
                </div>
                <div className="text-base">
                  我们的平台，犹如一个静谧的创作角落，为每一位用户提供温馨且便捷的服务。让每一张照片，都能在世界的角落里，带着您的印记，讲述独一无二的故事。
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
