import timm
import torch
import torch.nn as nn
from torchvision.ops.misc import Conv2dNormActivation


class Upsampler(nn.Module):
    def __init__(self):
        super().__init__()
        
    def forward(self, x: list[torch.tensor]) -> torch.tensor:
        # Get shapes of all tensors
        shapes = torch.stack([torch.tensor([t.shape[-2], t.shape[-1]]) for t in x])
        
        # Get max dimensions
        max_shape = torch.max(shapes, dim=0).values
        max_h, max_w = int(max_shape[0]), int(max_shape[1])
        
        outputs = []
        for tensor in x:
            curr_h, curr_w = tensor.shape[-2:]
            if curr_h != max_h or curr_w != max_w:
                tensor = nn.functional.interpolate(tensor, size=(max_h, max_w), mode='bilinear', align_corners=False)
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
                                                             activation_layer=None),
                                        torch.nn.AdaptiveAvgPool2d((1, 1)))
    
    def forward(self, x:torch.tensor):
        x = self.extractor(x)
        x = self.upsampler(x)
        x = self.predictor(x)
        x = x.view(-1, 4)
        return {'logits': x,
                'probs': torch.sigmoid(x)}
    
    def prediction(self, x:torch.tensor):
        return self(x)['probs']
    
def convert_to_onnx(model, save_path='model.onnx', input_shape=(1, 1, 384, 384)):
    model.eval()
    
    # Create dummy input
    dummy_input = torch.randn(input_shape)
    
    torch.onnx.export(model,                      
        dummy_input,               
        save_path,                 
        export_params=True,        
        opset_version=17,          
        do_constant_folding=True,  
        input_names=['input'],     
        output_names=['output'],   
        dynamic_axes={             
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"Model has been converted to ONNX and saved at {save_path}")



        
if __name__ == '__main__':
    model = Model()
    x = torch.randn((1, 1, 384, 384))
    output = model(x)
    
    for key, val in output.items():
        print(key, val.shape)

    convert_to_onnx(model, save_path='model.onnx')