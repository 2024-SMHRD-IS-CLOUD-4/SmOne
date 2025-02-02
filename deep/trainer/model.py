import timm
import torch
import torch.nn as nn
from torchvision.ops.misc import Conv2dNormActivation


class Upsampler(nn.Module):
    def __init__(self):
        super().__init__()
        
    def get_max_shape(self, x: list[torch.tensor]):
        max_h, max_w = 0, 0
        for tensor in x:
            h, w = tensor.shape[-2:]
            max_h = max(max_h, h)
            max_w = max(max_w, w)
        return max_h, max_w
    
    def forward(self, x: list[torch.tensor]) ->torch.tensor:
        max_h, max_w = self.get_max_shape(x)
        
        outputs = []
        for tensor in x:
            h, w = tensor.shape[-2:]
            if h < max_h or w < max_w:
                tensor = nn.functional.interpolate(tensor, size=(max_h, max_w), mode='bilinear')
            outputs.append(tensor)
        
        return torch.cat(outputs, dim=1)
        

class Model(nn.Module):
    def __init__(self):
        super().__init__()
        self.extractor = timm.create_model('mobilenetv4_conv_small_050.e3000_r224_in1k', 
                          features_only=True,
                          pretrained=True,
                          in_chans=1,
                          out_indices=(1, 2, 3, 4))
        
        self.upsampler = Upsampler()

        self.predictor = nn.Sequential(Conv2dNormActivation(16+32+48+480, 128,
                                                            kernel_size=3,
                                                            padding=1,
                                                            norm_layer=nn.BatchNorm2d,
                                                            activation_layer=nn.ReLU),
                                        Conv2dNormActivation(128, 4,
                                                             kernel_size=1,
                                                             norm_layer=None,
                                                             activation_layer=None))


    
    def forward(self, x:torch.tensor):
        input_shape = x.shape[-2:]
        x = self.extractor(x)
        x = self.upsampler(x)
        x = self.predictor(x)
        
        x = nn.functional.interpolate(x, size=input_shape, mode='bilinear')
        return x
        
        
if __name__ == '__main__':
    model = Model()
    x = torch.randn((1, 1, 384, 384))
    output = model(x)
    print(output.shape)



    